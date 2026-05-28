<!--
 * TencentBlueKing is pleased to support the open source community by making 蓝鲸智云-DB管理系统(BlueKing-BK-DBM) available.
 *
 * Copyright (C) 2017-2023 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License athttps://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for
 * the specific language governing permissions and limitations under the License.
-->

<template>
  <BkSideslider
    v-model:is-show="isShow"
    class="pkg-type-manage-slider"
    quick-close
    render-directive="if"
    :width="800">
    <template #header>
      <div class="header-main">
        <span class="title">{{ t('管理包类型') }}</span>
        <span class="split-line" />
        <span class="sub-title">{{ dbTypeLabel }}</span>
      </div>
    </template>
    <div class="content-main">
      <div class="header-action">
        <BkButton
          action-id="package_manage"
          :resource="dbType"
          theme="primary"
          @click="handleCreate">
          <DbIcon
            class="mr-4"
            type="add" />
          {{ t('新建包类型') }}
        </BkButton>
      </div>
      <div class="pkg-type-table">
        <BkTable
          :data="pkgTypeList"
          :max-height="tableHeight"
          row-key="id">
          <BkTableColumn
            field="name"
            :label="t('显示名')"
            :min-width="200"
            show-overflow="tooltip" />
          <BkTableColumn
            field="value"
            :label="t('标识')"
            :min-width="200"
            show-overflow="tooltip" />
          <BkTableColumn
            field="version_num"
            :label="t('版本号位数')"
            :min-width="140">
            <template #default="{ data }: { data: PkgTypeItem }"> {{ data.version_num }} {{ t('位') }} </template>
          </BkTableColumn>
          <BkTableColumn
            fixed="right"
            :label="t('操作')"
            :min-width="120">
            <template #default="{ data }: { data: PkgTypeItem }">
              <BkButton
                class="mr-8"
                text
                theme="primary"
                @click="() => handleEdit(data)">
                {{ t('编辑') }}
              </BkButton>
              <BkButton
                v-bk-tooltips="{
                  content: t('该包类型下存在 n 个版本，请删除后再操作', { n: data.related_versions }),
                  disabled: data.related_versions === 0,
                }"
                :disabled="data.related_versions > 0"
                text
                theme="primary"
                @click="() => handleConfirmDelete(data)">
                {{ t('删除') }}
              </BkButton>
            </template>
          </BkTableColumn>
        </BkTable>
      </div>
    </div>
  </BkSideslider>
  <EditPkgType
    ref="editPkgTypeRef"
    v-model:is-show="isShowEdit"
    :data="currentPkgType"
    :db-type="dbType"
    :existed-identifier-list="existedIdentifierList"
    :is-edit="isEdit"
    :total-list="pkgTypeList"
    @success="handleEditSuccess" />
</template>

<script setup lang="tsx">
  import { InfoBox } from 'bkui-vue';
  import { useI18n } from 'vue-i18n';
  import { useRequest } from 'vue-request';

  import { updatePkgType } from '@services/source/version';

  import { messageSuccess } from '@utils';

  import type { PkgTypeItem } from '../../Index.vue';

  import EditPkgType from './components/EditPkgType.vue';

  interface Props {
    dbType: string;
    dbTypeLabel: string;
    pkgTypeList: PkgTypeItem[];
  }

  type Emits = (e: 'success') => void;

  interface Exposes {
    createPkgType: () => void;
  }

  const props = defineProps<Props>();

  const emits = defineEmits<Emits>();

  const isShow = defineModel<boolean>('isShow', {
    default: false,
  });

  const { t } = useI18n();

  const tableHeight = ref(window.innerHeight - 140);

  const isShowEdit = ref(false);
  const isEdit = ref(false);
  const currentPkgType = ref<PkgTypeItem>();
  const editPkgTypeRef = ref<InstanceType<typeof EditPkgType>>();

  const existedIdentifierList = computed(() => props.pkgTypeList.map((item) => item.value.toLocaleLowerCase()));

  const { runAsync: runDeletePkgType } = useRequest(updatePkgType, {
    manual: true,
    onSuccess() {
      messageSuccess(t('操作成功'));
      emits('success');
    },
  });

  const handleResize = () => {
    tableHeight.value = window.innerHeight - 140;
  };

  const handleCreate = () => {
    isEdit.value = false;
    currentPkgType.value = undefined;
    isShowEdit.value = true;
  };

  const handleEdit = (data: PkgTypeItem) => {
    isEdit.value = true;
    currentPkgType.value = data;
    isShowEdit.value = true;
  };

  const handleConfirmDelete = (data: PkgTypeItem) => {
    InfoBox({
      cancelText: t('取消'),
      class: 'pkg-type-manage-confirm-delete-box',
      confirmText: t('确认删除'),
      contentAlign: 'center',
      footerAlign: 'center',
      headerAlign: 'center',
      infoType: 'warning',
      onConfirm: () =>
        runDeletePkgType({
          db_type: props.dbType,
          items: props.pkgTypeList.filter((item) => item.value !== data.value),
        }),
      subTitle: (
        <div class='sub-title-content'>{t('删除后该包类型在所有页面将不可见；其下的默认发行版会同步清理。')}</div>
      ),
      title: t('确认删除包类型「name」？', { name: data.name }),
      width: 480,
    });
  };

  const handleEditSuccess = () => {
    emits('success');
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  defineExpose<Exposes>({
    createPkgType: handleCreate,
  });
</script>
<style lang="less">
  .pkg-type-manage-slider {
    .header-main {
      display: flex;
      align-items: center;

      .title {
        font-size: 16px;
        color: #313238;
      }

      .split-line {
        width: 1px;
        height: 14px;
        margin: 0 10px;
        background-color: #dcdee5;
      }

      .sub-title {
        font-size: 14px;
        color: #979ba5;
      }
    }

    .content-main {
      display: flex;
      height: 100%;
      padding: 16px 24px 0;
      flex-direction: column;
      overflow: hidden;

      .header-action {
        margin-bottom: 16px;
      }

      .pkg-type-table {
        flex: 1;
        overflow: hidden;
      }
    }
  }

  .pkg-type-manage-confirm-delete-box {
    .sub-title-content {
      padding: 12px 16px;
      color: #4d4f56;
      text-align: left;
      background: #f5f7fa;
      border-radius: 2px;
    }
  }
</style>
