import { FlowTypes } from '@services/source/taskflow';

import { getCostTimeDisplay } from '@utils';

import { t } from '@locales/index';

export type RenderCollectionKey = 'round' | 'ractangle' | 'empty';

enum NODE_ICON {
  actuator_script = 'db-icon-deploy',
  db_resource_pool = 'db-icon-check-search',
  transfer_file = 'db-icon-file',
}

export const NODE_STATUS_TEXT = {
  CREATED: '待执行',
  FAILED: '执行失败',
  FINISHED: '执行成功',
  READY: '待执行',
  REVOKED: '已终止',
  RUNNING: '执行中',
  SKIPPED: '跳过',
} as Readonly<Record<string, string>>;

export function renderRactangle(node: any) {
  // const node: GraphNode = args[0];
  // const flowInfo = args[1];
  const {
    component,
    pipeline,
    retryable,
    skip,
    skippable,
    started_at: startedAt,
    status,
    type,
    updated_at: updatedAt,
  } = node.data;

  const activities = pipeline?.activities;
  let isParentFlow = false;
  const abstractNum = {
    failed: 0,
    running: 0,
    success: 0,
  };

  if (activities) {
    const activityList = Object.values(activities);
    isParentFlow = activityList.length > 0;
    activityList.forEach((activity: any) => {
      if (activity.status === 'FAILED') {
        abstractNum.failed = abstractNum.failed + 1;
      } else if (activity.status === 'FINISHED') {
        abstractNum.success = abstractNum.success + 1;
      } else if (activity.status === 'RUNNING') {
        abstractNum.running = abstractNum.running + 1;
      }
    });
  }

  const getNodeCls = (nodeStatus: string, isSkip: boolean) => {
    if (node.isTodoNode) {
      return 'node-ractangle--todo';
    }
    if (isSkip) {
      return 'node-ractangle--skipped';
    }
    return nodeStatus ? `node-ractangle--${nodeStatus.toLowerCase()}` : '';
  };

  const getNodeStatusText = (isSkip: boolean) => {
    // if (node.isTodoNode) {
    //   return t('待执行');
    // }
    if (isSkip) {
      return t('忽略错误');
    }
    const nodeStatusText = status ? NODE_STATUS_TEXT[status] : '';
    return nodeStatusText ? t(nodeStatusText) : t('待执行');
  };

  const icon =
    component && component.code in NODE_ICON
      ? NODE_ICON[component.code as keyof typeof NODE_ICON]
      : 'db-icon-default-node';
  const nodeCls = getNodeCls(status, skip);
  const createdStatus = status && status.toLowerCase() === 'created';
  const nodeClickType = type === 'ServiceActivity' && !createdStatus ? 'log' : '';
  const isShowTime = status !== 'CREATED' && updatedAt && startedAt && updatedAt - startedAt >= 0;
  const diffSeconds = status === 'RUNNING' ? Math.floor(Date.now() / 1000) - startedAt : updatedAt - startedAt;
  return `<div class="node-ractangle-layout ${node.children || nodeClickType ? 'node-hover' : ''}">
        ${
          node.children
            ? `<div class="node-ractangle-collapse">
            <i class="bk-dbm-icon node-ractangle-collapse-open ${node.isExpand ? 'db-icon-minus-fill' : 'db-icon-plus-8'}></i>
          </div>`
            : ''
        }
        <div
          class="node-ractangle  ${nodeCls}"
          data-evt-type=${nodeClickType}
          data-node-id=${node.id}
          style=${`max-width: calc(100% - ${node.children ? '14px' : 0})`}>
          <div class="node-ractangle__status">
            <i class="node-ractangle__icon  ${icon}"></i>
          </div>
          <div class='node-ractangle__content'>
            <div class='node-ractangle__content-left text-overflow'>
              <strong
                class='node-ractangle__name'
                title=${node.data.name as string}>
                ${node.data.name}
              </strong>
              <p class='node-ractangle__text'>
                ${
                  isParentFlow
                    ? `<span style='color: #63656E'>
                    <span
                      style='color: #2DCB56'
                      title=${t('成功')}>
                      ${abstractNum.success}
                    </span>
                    <span style='margin: 0 5px'>/</span>
                    <span
                      style='color: #EA3636'
                      title=${t('失败')}>
                      ${abstractNum.failed}
                    </span>
                    <span style='margin: 0 5px'>/</span>
                    <span
                      style='color: #3a84ff'
                      title=${t('执行中')}>
                      ${abstractNum.running}
                    </span>
                  </span>`
                    : getNodeStatusText(skip)
                }
              </p>
            </div>
            <span class='node-ractangle__time'>${isShowTime ? getCostTimeDisplay(diffSeconds) : ''}</span>
          </div>
        </div>
      </div>`;
}

export function renderRound(node: any) {
  const { status } = node.data;
  const text = node.data.type === FlowTypes.EmptyStartEvent ? t('始') : t('终');
  const nodeCls = status ? `node-round--${status.toLowerCase()}` : '';
  return `<div
        class="node-round ${nodeCls}"
        data-node-id=${node.id}>
        <span>${text}</span>
      </div>`;
}

export function render(data: any) {
  const { tpl } = data;
  const renderCollection: Record<string, any> = {
    ractangle: renderRactangle,
    round: renderRound,
  };

  if (tpl in renderCollection) {
    return renderCollection[tpl](data);
  }

  return `type [${tpl}] render not found`;
}
