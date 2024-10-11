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
  <div class="spec-mem spec-form-item">
    <div class="spec-form-item__label">
      <BkDropdown
        :disabled="isEdit"
        placement="bottom"
        trigger="click"
        @hide="handleHidePopover">
        <div
          v-bk-tooltips="{
            content: t('不支持修改'),
            disabled: !isEdit,
          }"
          class="operation-more-main"
          @click="handleClickMore">
          <BkButton
            class="mr-4"
            text>
            {{ currentTitle }}
          </BkButton>
          <DbIcon
            class="more-icon"
            :class="{
              'more-icon-active': isRotate,
              'icon-disabled': isEdit,
            }"
            type="down-shape" />
        </div>
        <template #content>
          <BkDropdownMenu>
            <BkDropdownItem
              v-for="(item, index) in titleList"
              :key="index"
              @click="() => handleChooseType(item.value)"
              >{{ item.title }}</BkDropdownItem
            >
          </BkDropdownMenu>
        </template>
      </BkDropdown>
    </div>
    <SpecDevice
      v-if="currentType === 'device_class'"
      v-model="deviceClassModelValue"
      :is-edit="isEdit" />
    <div
      v-else
      class="cpu-mem-main">
      <SpecCPU
        v-model="cpuModelValue"
        :is-edit="isEdit" />
      <SpecMem
        v-model="memModelValue"
        :is-edit="isEdit" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  import SpecCPU from './components/SpecCPU.vue';
  import SpecDevice from './components/SpecDevice.vue';
  import SpecMem from './components/SpecMem.vue';

  interface Props {
    isEdit: boolean;
  }

  interface Exposes {
    getCurrentType: () => string;
  }

  const props = withDefaults(defineProps<Props>(), {
    isEdit: false,
  });

  const deviceClassModelValue = defineModel<string[]>('deviceClass', { required: true });

  const cpuModelValue = defineModel<{
    min: number | string;
    max: number | string;
  }>('cpu', { required: true });

  const memModelValue = defineModel<{
    min: number | string;
    max: number | string;
  }>('mem', { required: true });

  const { t } = useI18n();

  const titleList = [
    {
      title: t('机型'),
      value: 'device_class',
    },
    {
      title: t('CPU/内存'),
      value: 'cpu_mem',
    },
  ];

  const isRotate = ref(false);
  const currentType = ref(titleList[0].value);

  const currentTitle = computed(() => (currentType.value === 'device_class' ? titleList[0].title : titleList[1].title));

  watch(
    cpuModelValue,
    () => {
      if (cpuModelValue.value.max === '') {
        currentType.value = titleList[0].value;
        return;
      }

      currentType.value = titleList[1].value;
    },
    {
      immediate: true,
    },
  );

  const handleClickMore = () => {
    if (props.isEdit) {
      return;
    }

    isRotate.value = !isRotate.value;
  };

  const handleHidePopover = () => {
    isRotate.value = false;
  };

  const handleChooseType = (value: string) => {
    if (currentType.value === value) {
      return;
    }

    currentType.value = value;
  };

  defineExpose<Exposes>({
    getCurrentType() {
      return currentType.value;
    },
  });
</script>

<style lang="less" scoped>
  @import '../specFormItem.less';

  .operation-more-main {
    display: flex;
    color: #63656e;
    cursor: pointer;
    align-items: center;

    .more-icon {
      transform: rotate(0deg);
      transition: all 0.5s;
    }

    .more-icon-active {
      transform: rotate(-180deg);
    }

    .icon-disabled {
      color: #c4c6cc;
    }
  }

  .cpu-mem-main {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
