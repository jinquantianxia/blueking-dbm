<template>
  <BkDialog
    v-model:is-show="isShow"
    class="edit-pkg-type-dialog"
    quick-close
    render-directive="if"
    :title="isEdit ? t('编辑包类型') : t('新建包类型')"
    :width="480">
    <BkForm
      ref="formRef"
      form-type="vertical"
      :model="formModel"
      :rules="formRules"
      @validate="handleFormValidate">
      <BkFormItem
        :label="t('标识')"
        property="value"
        required>
        <BkInput
          v-model="formModel.value"
          :disabled="isEdit"
          :placeholder="t('请输入标识')" />
        <div
          v-if="showValueNormalTip"
          class="edit-pkg-type-form-desc">
          {{ t('字母 / 数字 / _ / -，创建后不可修改') }}
        </div>
      </BkFormItem>
      <BkFormItem
        :label="t('显示名')"
        property="name"
        required>
        <BkInput
          v-model="formModel.name"
          :placeholder="t('请输入显示名')" />
        <div
          v-if="showNameNormalTip"
          class="edit-pkg-type-form-desc">
          {{ t('1~30 字符，UI 展示用，创建后可修改') }}
        </div>
      </BkFormItem>
      <BkFormItem
        :label="t('版本号位数')"
        property="version_num"
        required>
        <BkRadioGroup
          v-model="formModel.version_num"
          :disabled="isVersionNumDisabled">
          <BkRadio
            v-for="item in versionDigitOptions"
            :key="item.value"
            :label="item.value">
            {{ item.label }}
          </BkRadio>
        </BkRadioGroup>
        <div
          v-if="isEdit"
          class="edit-pkg-type-form-desc is-last-tip">
          {{
            data?.related_versions && data?.related_versions > 0
              ? t('已有 n 个版本，位数不可修改', { n: data?.related_versions || 0 })
              : t('该包类型尚无版本，可调整位数；一旦添加版本即冻结')
          }}
        </div>
        <div
          v-else
          class="edit-pkg-type-form-desc is-last-tip">
          {{ t('创建后不可修改，填错只能删除该包类型后重建') }}
        </div>
      </BkFormItem>
    </BkForm>
    <template #footer>
      <BkButton @click="handleCancel">
        {{ t('取消') }}
      </BkButton>
      <BkButton
        class="ml-8"
        :loading="updateLoading"
        theme="primary"
        @click="handleSubmit">
        {{ t('确定') }}
      </BkButton>
    </template>
  </BkDialog>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useRequest } from 'vue-request';

  import { updatePkgType } from '@services/source/version';

  import { messageSuccess } from '@utils';

  interface Props {
    data?: {
      name: string;
      related_versions: number;
      value: string;
      version_num: number;
    };
    dbType: string;
    existedIdentifierList: string[];
    isEdit: boolean;
    totalList: NonNullable<Props['data']>[];
  }

  type Emits = (e: 'success') => void;

  const props = defineProps<Props>();

  const emits = defineEmits<Emits>();

  const isShow = defineModel<boolean>('isShow', {
    default: false,
  });

  const { t } = useI18n();

  const formRef = ref();
  const formModel = ref({
    name: '',
    value: '',
    version_num: 3,
  });
  const showValueNormalTip = ref(true);
  const showNameNormalTip = ref(true);

  const versionDigitOptions = [
    {
      label: t('3 位 (如 5.0.14)'),
      value: 3,
    },
    {
      label: t('6 位 (如 8.0.30.1.0.0)'),
      value: 6,
    },
  ];

  const isVersionNumDisabled = computed(() => props.isEdit && (props.data?.related_versions ?? 0) > 0);

  const formRules = computed(() => ({
    name: [
      {
        message: t('请输入显示名'),
        trigger: 'blur',
        validator: (value: string) => !!value.trim(),
      },
      {
        message: t('显示名长度为 1~30 字符'),
        trigger: 'blur',
        validator: (value: string) => value.trim().length >= 1 && value.trim().length <= 30,
      },
    ],
    value: [
      {
        message: t('请输入标识'),
        trigger: 'blur',
        validator: (value: string) => !!value.trim(),
      },
      {
        message: t('只允许字母 / 数字 / 下划线 / 中划线'),
        trigger: 'blur',
        validator: (value: string) => /^[a-zA-Z0-9_-]+$/.test(value),
      },
      {
        message: t('该标识已存在'),
        trigger: 'blur',
        validator: (value: string) => {
          if (props.isEdit) {
            return true;
          }
          return !props.existedIdentifierList.includes(value.toLocaleLowerCase());
        },
      },
    ],
  }));

  const { loading: updateLoading, run: runUpdatePkgType } = useRequest(updatePkgType, {
    manual: true,
    onSuccess() {
      isShow.value = false;
      messageSuccess(t('操作成功'));
      emits('success');
    },
  });

  watch(isShow, (show) => {
    if (!show) {
      return;
    }
    formModel.value = {
      name: props.data?.name || '',
      value: props.data?.value || '',
      version_num: props.data?.version_num || 3,
    };
  });

  const handleSubmit = async () => {
    await formRef.value.validate();
    const items = props.totalList.reduce<Props['totalList']>((acc, item) => {
      if (item.value !== formModel.value.value) {
        acc.push({
          name: item.name,
          related_versions: item.related_versions,
          value: item.value,
          version_num: item.version_num,
        });
      } else {
        acc.push({
          name: formModel.value.name,
          related_versions: item.related_versions,
          value: formModel.value.value,
          version_num: formModel.value.version_num,
        });
      }
      return acc;
    }, []);
    if (!props.isEdit) {
      items.push({
        name: formModel.value.name,
        related_versions: 0,
        value: formModel.value.value,
        version_num: formModel.value.version_num,
      });
    }
    runUpdatePkgType({
      db_type: props.dbType,
      items,
    });
  };

  const handleCancel = () => {
    isShow.value = false;
  };

  const handleFormValidate = (property: string, result: boolean) => {
    if (property === 'value') {
      showValueNormalTip.value = result;
      return;
    }

    if (property === 'name') {
      showNameNormalTip.value = result;
    }
  };
</script>

<style lang="less">
  .edit-pkg-type-dialog {
    .edit-pkg-type-form-desc {
      margin-top: 4px;
      font-size: 12px;
      line-height: 20px;
      color: #979ba5;

      &.is-last-tip {
        margin-top: -6px;
      }
    }
  }
</style>
