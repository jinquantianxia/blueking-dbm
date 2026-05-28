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
  <ApplyPermissionCatch>
    <div class="version-files-page">
      <DbTab
        v-model="dbTypeActive"
        :exclude="[DBTypes.TENDBCLUSTER]" />
      <div
        v-if="renderPkgTypeList.length > 0"
        class="veriosn-content-main"
        :class="{ 'has-package-manage-permission': hasPackageManagePermission }">
        <div
          v-bk-loading="{ loading: pkgTypeListLoading }"
          class="pkg-tab-main-container">
          <BkTab
            :key="pkgActive"
            v-model:active="pkgActive"
            class="pkg-tab-main"
            type="card-tab">
            <BkTabPanel
              v-for="tab of renderPkgTypeList"
              :key="tab.name"
              :label="tab.label"
              :name="tab.name" />
          </BkTab>
          <BkButton
            v-if="hasPackageManagePermission"
            class="manage-pkg-type-button"
            @click="isShowPkgTypeManage = true">
            <DbIcon type="baoguanli" />
            <span class="ml-4">{{ t('管理包类型') }}</span>
          </BkButton>
        </div>
        <div class="content-main">
          <List
            :db-type="dbTypeActive"
            :has-package-manage-permission="hasPackageManagePermission"
            :pkg-label-map="pkgLabelMap"
            :pkg-type="pkgActive"
            :tabs="renderTabs" />
        </div>
      </div>
      <BkException
        v-else
        class="pkg-type-empty-main"
        type="empty">
        <span>{{ t('该数据库类型下暂无包类型') }}</span>
        <span class="ml-4 mr-4">,</span>
        <span class="mr-4">{{ t('立即') }}</span>
        <AuthButton
          action-id="package_manage"
          :permission="hasPackageManagePermission"
          :resource="dbTypeActive"
          size="small"
          text
          theme="primary"
          @click="handleCreatePkgType">
          {{ t('新建包类型') }}
        </AuthButton>
      </BkException>
    </div>
    <PkgTypeManage
      ref="pkgTypeManageRef"
      v-model:is-show="isShowPkgTypeManage"
      :db-type="dbTypeActive"
      :db-type-label="activeTabInfo.label"
      :pkg-type-list="pkgTypeList || []"
      @success="handleGetPkgTypeList" />
  </ApplyPermissionCatch>
</template>
<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useRequest } from 'vue-request';
  import { useRoute, useRouter } from 'vue-router';

  import type {
    ControllerBaseInfo,
    ExtractedControllerDataKeys,
    FunctionKeys,
  } from '@services/model/function-controller/functionController';
  import { simpleCheckAllowed } from '@services/source/iam';
  import { getPkgTypeList } from '@services/source/version';

  import { useFunController } from '@stores';

  import { DBTypes } from '@common/const';

  import ApplyPermissionCatch from '@components/apply-permission/Catch.vue';
  import DbTab from '@components/db-tab/Index.vue';

  import List from './components/list/Index.vue';
  import PkgTypeManage from './components/pkg-type-manage/Index.vue';

  export interface TabItem {
    children: {
      controllerId?: FunctionKeys;
      label: string;
      name: string;
    }[];
    controller: {
      id?: FunctionKeys;
      moduleId: ExtractedControllerDataKeys;
    };
    label: string;
    name: string;
  }

  export type PkgTypeItem = ServiceReturnType<typeof getPkgTypeList>[number];

  const { t } = useI18n();
  const funControllerStore = useFunController();
  const route = useRoute();
  const router = useRouter();

  const tabChildrenControllerIdMap: Record<string, FunctionKeys> = {
    tendisplus: 'PredixyTendisplusCluster',
    tendisssd: 'TwemproxyTendisSSDInstance',
    twemproxy: 'TwemproxyRedisInstance',
  };

  const pkgTypeManageRef = ref<InstanceType<typeof PkgTypeManage>>();
  const pkgActive = ref('');
  const dbTypeActive = ref<DBTypes>(DBTypes.MYSQL);
  const isShowPkgTypeManage = ref(false);
  const hasPackageManagePermission = ref(false);
  const tabs = ref<TabItem[]>([
    {
      children: [],
      controller: {
        moduleId: 'mysql',
      },
      label: 'MySQL',
      name: DBTypes.MYSQL,
    },
    {
      children: [],
      controller: {
        moduleId: 'redis',
      },
      label: 'Redis',
      name: DBTypes.REDIS,
    },
    {
      children: [],
      controller: {
        id: 'es',
        moduleId: 'bigdata',
      },
      label: 'ES',
      name: DBTypes.ES,
    },
    {
      children: [],
      controller: {
        id: 'kafka',
        moduleId: 'bigdata',
      },
      label: 'Kafka',
      name: DBTypes.KAFKA,
    },
    {
      children: [],
      controller: {
        id: 'hdfs',
        moduleId: 'bigdata',
      },
      label: 'HDFS',
      name: DBTypes.HDFS,
    },
    {
      children: [],
      controller: {
        id: 'pulsar',
        moduleId: 'bigdata',
      },
      label: 'Pulsar',
      name: DBTypes.PULSAR,
    },
    {
      children: [],
      controller: {
        id: 'influxdb',
        moduleId: 'bigdata',
      },
      label: 'InfluxDB',
      name: DBTypes.INFLUXDB,
    },
    {
      children: [],
      controller: {
        id: 'riak',
        moduleId: 'bigdata',
      },
      label: 'Riak',
      name: DBTypes.RIAK,
    },
    {
      children: [],
      controller: {
        moduleId: 'mongodb',
      },
      label: 'MongoDB',
      name: DBTypes.MONGODB,
    },
    {
      children: [],
      controller: {
        moduleId: 'sqlserver',
      },
      label: 'SQLServer',
      name: DBTypes.SQLSERVER,
    },
    {
      children: [],
      controller: {
        id: 'doris',
        moduleId: 'bigdata',
      },
      label: 'Doris',
      name: DBTypes.DORIS,
    },
    {
      children: [],
      controller: {
        moduleId: 'oracle',
      },
      label: 'Oracle',
      name: DBTypes.ORACLE,
    },
  ]);

  const pkgLabelMap = computed(() =>
    tabs.value.reduce<Record<string, string>>((dataMap, item) => {
      item.children.forEach((child) => {
        Object.assign(dataMap, {
          [child.name]: child.label,
        });
      });
      return dataMap;
    }, {}),
  );

  const renderTabs = computed(() =>
    tabs.value.reduce<TabItem[]>((result, item) => {
      const { id, moduleId } = item.controller;
      const data = funControllerStore.funControllerData[moduleId] as any;
      // 整个模块没有开启
      if (!data || data.is_enabled !== true) {
        return result;
      }
      const children = data.children as Record<FunctionKeys, ControllerBaseInfo>;
      // 模块中的功能没开启
      if (id && !children[id]?.is_enabled) {
        return result;
      }
      const tabChildren = item.children.filter((child) => {
        // 不需要校验功能是否开启
        if (child.controllerId === undefined) {
          return true;
        }
        return children[child.controllerId]?.is_enabled;
      });
      result.push({
        ...item,
        children: tabChildren,
      });
      return result;
    }, []),
  );

  const activeTabInfo = computed(() => {
    const tabList = renderTabs.value.find((item) => item.name === dbTypeActive.value);
    return tabList
      ? tabList
      : {
          children: [],
          label: '',
          name: '',
        };
  });

  const renderPkgTypeList = computed(() => activeTabInfo.value?.children || []);

  const {
    data: pkgTypeList,
    loading: pkgTypeListLoading,
    run: fetchPkgTypeList,
  } = useRequest(getPkgTypeList, {
    manual: true,
    onSuccess(data) {
      const targetTabIndex = tabs.value.findIndex((item) => item.name === dbTypeActive.value);
      if (targetTabIndex !== -1) {
        tabs.value[targetTabIndex].children = data.map((item) => ({
          controllerId: tabChildrenControllerIdMap[item.value],
          label: item.name,
          name: item.value,
        }));
      }
    },
  });

  let isFirstLoad = true;
  let hasPackageViewPermission = false;

  const handleGetPkgTypeList = () => {
    fetchPkgTypeList({
      db_type: dbTypeActive.value,
    });
  };

  const checkPackageManagePermission = async () => {
    hasPackageManagePermission.value = await simpleCheckAllowed({
      action_id: 'package_manage',
      resource_id: dbTypeActive.value,
    });
  };

  watch(dbTypeActive, handleGetPkgTypeList, {
    immediate: true,
  });

  watch([dbTypeActive, pkgActive], () => {
    if (!dbTypeActive.value || !pkgActive.value) {
      return;
    }

    const { dbType, pkgType } = route.query;
    if (dbType === dbTypeActive.value && pkgType === pkgActive.value) {
      return;
    }

    router.replace({
      query: {
        ...route.query,
        dbType: dbTypeActive.value,
        pkgType: pkgActive.value,
      },
    });
  });

  watch(dbTypeActive, () => {
    if (!hasPackageViewPermission) {
      return;
    }

    checkPackageManagePermission();
  });

  watch(pkgTypeList, () => {
    if (!pkgTypeList.value?.length) {
      return;
    }

    if (isFirstLoad) {
      isFirstLoad = false;
      return;
    }

    const valueList = pkgTypeList.value.map((item) => item.value);
    if (pkgActive.value && valueList.includes(pkgActive.value)) {
      return;
    }

    pkgActive.value = pkgTypeList.value[0]?.value || '';
  });

  const checkPackagePermission = async () => {
    hasPackageViewPermission = await simpleCheckAllowed(
      {
        action_id: 'package_view',
        is_raise_exception: true,
        resource_id: '',
      },
      {
        permission: 'page',
      },
    );
    if (!hasPackageViewPermission) {
      return;
    }

    checkPackageManagePermission();
  };

  const handleCreatePkgType = () => {
    isShowPkgTypeManage.value = true;
    nextTick(() => {
      pkgTypeManageRef.value?.createPkgType();
    });
  };

  checkPackagePermission();

  onMounted(() => {
    const { dbType, pkgType } = route.query;
    if (dbType) {
      dbTypeActive.value = dbType as DBTypes;
    }
    if (pkgType) {
      nextTick(() => {
        pkgActive.value = pkgType as string;
      });
    }
  });
</script>
<style lang="less">
  .version-files-page {
    display: flex;
    height: 100%;
    flex-direction: column;

    .veriosn-content-main {
      display: flex;
      padding: 20px 24px;
      overflow: hidden;
      flex: 1;
      flex-direction: column;

      .pkg-tab-main-container {
        position: relative;
        height: 42px;
      }

      &.has-package-manage-permission {
        .pkg-tab-main {
          .bk-tab-header-nav {
            max-width: calc(100% - 140px);
          }
        }
      }

      .pkg-tab-main {
        .bk-tab-content {
          display: none;
        }
      }

      .manage-pkg-type-button {
        position: absolute;
        top: 7px;
        right: 6px;
        width: 120px;
      }

      .content-main {
        overflow: hidden;
        background-color: #fff;
        flex: 1;
      }
    }
  }
</style>
