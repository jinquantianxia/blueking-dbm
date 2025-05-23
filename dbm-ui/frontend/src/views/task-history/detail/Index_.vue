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
  <div class="mission-detail-page">
    <div
      id="g6-container"
      class="mission-flows"></div>
  </div>
</template>
<script setup lang="ts">
  import { getTaskflowDetails } from '@services/source/taskflow';

  import TargetCluster from '@/views/db-manage/mongodb/MONGODB_PITR_RESTORE/components/TargetCluster.vue';
  import { Renderer as WebGLRenderer } from '@antv/g-webgl';
  import { ExtensionCategory, Graph, GraphEvent, register, treeToGraphData } from '@antv/g6';
  import { FruchtermanLayout } from '@antv/layout-gpu';

  import {
    activitesFlatenToNodes,
    dataTransform,
    generateEdges,
    getCurrentNodeChildenDataAndEdges,
    type Node,
    TreeNode,
  } from './utils';

  type TaskflowDetails = ServiceReturnType<typeof getTaskflowDetails>;

  const route = useRoute();

  const rootId = computed(() => route.params.root_id as string);

  const GREY_COLOR = '#CED4D9';

  register(ExtensionCategory.LAYOUT, 'fruchterman-gpu', FruchtermanLayout);
  register(ExtensionCategory.NODE, 'tree-node', TreeNode);

  /**
   * 拓扑初始化
   */
  onMounted(() => {
    getTaskflowDetails(
      { rootId: rootId.value },
      {
        permission: 'page',
      },
    ).then((data) => {
      // console.log('activities>>>', Object.values(data.activities).length);
      // console.log('flows>>>>', Object.values(data.flows).length);
      const { startEventIdToNodeMap } = activitesFlatenToNodes(data);
      const totalEdges = generateEdges(data, startEventIdToNodeMap);
      console.log('totalEdges===', totalEdges.length);
      const { edges, nodes } = getCurrentNodeChildenDataAndEdges(data, totalEdges);
      const graphData = {
        edges,
        nodes,
      };

      console.log('init nodes ===', nodes.length);
      console.log('init edges ===', edges.length);

      const graph = new Graph({
        autoFit: 'view',
        // node: {
        //   type: 'rect',
        //   style: {
        //     size: [60, 30],
        //     radius: 8,
        //     labelText: (d) => d.name,
        //     labelBackground: true,
        //     ports: [{ placement: 'top' }, { placement: 'bottom' }],
        //   },
        // },
        // edge: {
        //   type: 'cubic-vertical',
        //   // type: 'line',
        //   style: {
        //     endArrow: true,
        //   },
        // },
        // layout: {
        //   type: 'antv-dagre',
        //   ranksep: 50,
        //   nodesep: 15,
        //   // sortByCombo: true,
        //   // enableWorker: true,
        // },
        autoPaint: false, // 关闭自动渲染
        // renderer: () => new WebGLRenderer(),
        // webglParams: {
        //   preserveDrawingBuffer: false, // 减少内存占用
        //   antialias: false, // 关闭抗锯齿
        // },
        behaviors: ['drag-element', 'drag-canvas', 'zoom-canvas'],
        container: 'g6-container',
        data: graphData,
        defaultEdge: {
          style: {
            lineWidth: 0, // 初始线宽为0
            opacity: 0, // 初始透明
          },
        },
        edge: {
          style: {
            endArrow: true, // 边终点箭头开启: true,
            // stroke: GREY_COLOR,
          },
          type: 'cubic-horizontal',
        },
        edgeState: {
          active: {
            style: {
              opacity: 1,
            },
          },
          inactive: {
            style: {
              opacity: 0,
            },
          },
        },
        layout: {
          align: 'DL', // 节点对齐方式
          nodesep: 50, // 节点间距
          rankdir: 'LR', // 方向：从左到右（可选 TB/LR/BT/RL）
          ranksep: 100, // 层级间距
          type: 'dagre',
        },
        // layout: {
        //   direction: 'LR',
        //   dropCap: false,
        //   enableWorker: true,
        //   getHeight: () => 5,
        //   indent: 300,
        //   preLayout: false,
        //   type: 'indented',
        // },
        modes: {
          default: [
            {
              optimizeZoom: true, // 5.0新增的优化选项
              type: 'zoom-canvas',
            },
            'drag-canvas',
          ],
        },
        node: {
          animation: false,
          style: {
            ports: [{ placement: 'left' }, { placement: 'right' }],
            // ports: [{ placement: 'top' }, { placement: 'bottom' }],
            radius: 4,
            size: [202, 30],
          },
          type: 'tree-node',
        },
        plugins: [
          {
            key: 'minimap',
            position: 'right-top',
            size: [240, 160],
            type: 'minimap',
          },
        ],
      });

      graph.on('node:click', (e) => {
        const { target } = e; // 获取被点击节点的 ID

        // 获取节点数据
        const node = graph.getNodeData(target.id) as unknown as Node;
        console.log('???', node);
        if (node.pipeline) {
          const { edges, nodes } = getCurrentNodeChildenDataAndEdges(node.pipeline, totalEdges, node.id, false);
          // console.log('add nodes>>>', nodes);
          const existedEdges = graph.getEdgeData();
          const existedEdgesMap = existedEdges.reduce<Record<string, boolean>>((dataMap, edge) => {
            Object.assign(dataMap, { [edge.id!]: true });
            return dataMap;
          }, {});

          graph.addNodeData(nodes);
          // 批量添加多个节点
          graph.updateNodeData(nodes);
          const addEdges = edges.filter((edge) => !existedEdgesMap[edge.id]);
          // console.log('add edges>>>', addEdges);
          // 批量添加连接新节点的边
          graph.addEdgeData(addEdges);
          graph.updateEdgeData(addEdges);
          // 如果需要重新布局
          graph.render();
        }
        // const collapsed = !node.collapsed;
        // node.collapsed = collapsed;
        // // 1. 更新节点状态
        // // graph.setElementState(node.id, { collapsed });

        // // 2. 处理子元素显隐
        // const children = graph.getNodeData().filter((n) => n.parentId === node.id);
        // const childrenIds = children.map((child) => child.id);

        // children.forEach((child) => {
        //   collapsed ? graph.hideElement(child.id) : graph.showElement(child.id);
        // });

        // // 3. 处理相关边
        // graph.getEdgeData().forEach((edge) => {
        //   const shouldHide = [edge.source, edge.target].some((item) => item === node.id || childrenIds.includes(item));
        //   shouldHide ? graph.hideElement(edge.id) : graph.showElement(edge.id);
        // });
      });

      // graph.on(GraphEvent.AFTER_RENDER, () => {
      //   graph.fitView();
      // });

      graph.render();
    });
  });
</script>
<style lang="less">
  @import '@styles/mixins';

  .mission-detail-page {
    position: relative;
    height: calc(100% - 10px);

    .custom-main-breadcrumbs {
      top: -52px;
    }

    .db-card__content {
      height: 100%;
    }

    .mission-details {
      height: 100%;

      .mission-details-base {
        width: 80%;
        padding-left: 40px;

        .base-info__label {
          min-width: 100px;
          justify-content: flex-end;
        }
      }

      .mission-details-flows {
        height: calc(100% - 150px);
        padding: 14px 0;
        overflow: hidden;
        border-top: 1px solid @border-disable;

        .db-card__header {
          padding: 0 24px;
        }

        .db-card__content {
          padding-top: 14px;
        }
      }

      .flow-tools {
        padding-bottom: 2px;
        .flex-center();

        .flow-tools-icon {
          display: block;
          margin-left: 16px;
          font-size: @font-size-large;
          text-align: center;
          cursor: pointer;
        }

        .flow-tools-icon:hover,
        .flow-tools-icon-active {
          color: @primary-color;
        }
      }
    }

    .hot-key {
      width: 230px;

      .hot-key-title {
        padding-bottom: 8px;
        color: @title-color;
        border-bottom: 1px solid #eaebf0;
      }

      .hot-key-item {
        display: flex;
        padding: 8px 0 6px;
        color: @default-color;
        align-items: center;
      }

      .hot-key-text {
        margin-right: 32px;
      }

      .hot-key-code {
        min-width: 20px;
        padding: 0 6px;
        margin-right: 8px;
        line-height: 18px;
        border: 1px solid #dcdee5;
        border-radius: 2px;
      }
    }

    .mission-tips-content {
      width: 240px;
      padding: 8px 0;
      color: @default-color;

      .btn {
        width: 100%;
        margin-top: 14px;
        text-align: right;

        .bk-button {
          height: 26px;
          padding: 0 12px;
          font-size: 12px;
        }
      }
    }

    .mission-force-fail-tip {
      width: 280px;
      padding: 12px 0 8px;
      color: @default-color;

      .title {
        font-size: 16px;
        color: #313238;
      }

      .sub-title {
        margin-top: 6px;
        margin-bottom: 16px;
        font-size: 12px;
        color: #63656e;
      }

      .btn {
        width: 100%;
        margin-top: 14px;
        text-align: right;

        .confirm {
          width: 88px;
          color: #fff;
          background: #ea3636;
          border: none;
        }

        .bk-button {
          height: 26px;
          padding: 0 12px;
          font-size: 12px;
        }
      }
    }
    .flex() {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .box-shadow(@color: rgba(25,25,41,0.1)) {
      box-shadow: 0 2px 4px 0 @color;
    }

    .mission-flows {
      width: 100%;
      height: 100vh;
      font-size: @font-size-mini;

      .node-round {
        width: 48px;
        height: 48px;
        padding: 6px;
        font-weight: bold;
        color: @white-color;
        background-color: @bg-white;
        border-radius: 50%;
        .box-shadow();
        .flex();

        span {
          width: 100%;
          line-height: 36px;
          text-align: center;
          background-color: @bg-light-gray;
          border-radius: 50%;
        }

        &--finished {
          span {
            background-color: #4bc7ad;
          }
        }
      }

      .node-hover {
        cursor: pointer;

        &:hover {
          .node-ractangle {
            box-shadow: 0 2px 10px 0 rgb(25 25 41 / 10%);
          }

          .node-ractangle-collapse-open {
            color: @default-color;
          }
        }
      }

      .node-ractangle-layout {
        position: relative;
        height: 100%;
        font-size: @font-size-mini;
        .flex();

        .node-ractangle-collapse-open {
          color: @gray-color;
          background-color: @bg-white;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .node-ractangle-collapse {
          font-size: 14px;
          cursor: pointer;
          flex-shrink: 0;
        }
      }

      .node-ractangle {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: @bg-white;
        border-radius: 4px;
        flex: 1;
        .box-shadow(rgba(25,25,41,0.05));
        .flex();

        &[data-evt-type='log'] {
          cursor: pointer;
        }

        &__status {
          position: relative;
          flex-shrink: 0;
          width: 48px;
          height: 100%;
          background-color: @bg-light-gray;
          border-radius: 4px 0 0 4px;
          .flex();
        }

        &__icon {
          font-size: 24px;
          color: @white-color;

          &--loading {
            position: absolute;
            top: 50%;
            right: 50%;
            z-index: 0;
            width: 38px;
            height: 38px;
            margin: -19px;
            background-image: url('@images/flow-loading.png');
            background-size: 38px;
            animation: bkdata-ss-draft-node-running 2s linear infinite;

            @keyframes bkdata-ss-draft-node-running {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          }
        }

        &__content {
          height: 100%;
          padding: 8px;
          overflow: hidden;
          line-height: 16px;
          flex: 1;
          .flex();

          &-left {
            flex: 1;
            overflow: hidden;
          }
        }

        &__text {
          padding-top: 2px;
          color: @gray-color;
        }

        &__operations {
          position: absolute;
          top: -20px;
          left: 0;
          padding-bottom: 10px;

          .operation-icon {
            font-size: 16px;
            color: @white-color;
            cursor: pointer;
            background-color: #000;
            border-radius: 2px;
            opacity: 40%;

            &:hover {
              opacity: 60%;
            }
          }

          [class*='db-icon-'] {
            display: inline-block;
            width: 16px;
            height: 16px;
            font-size: 12px;
            line-height: 16px;
            vertical-align: top;
          }
        }

        &--finished {
          .node-ractangle__status {
            background-color: #4bc7ad;
          }

          .node-ractangle__text {
            color: #14a568;
          }
        }

        &--running {
          .node-ractangle__status {
            background-color: @bg-primary;
          }

          .node-ractangle__text {
            color: @primary-color;
          }
        }

        &--failed,
        &--revoked {
          .node-ractangle__status {
            background-color: #ff5656;
          }

          .node-ractangle__text {
            color: #ff5656;
          }
        }

        &--skipped {
          .node-ractangle__status {
            background-color: #89c053;
          }

          .node-ractangle__text {
            color: #89c053;
          }
        }

        &--todo {
          .node-ractangle__status {
            background-color: #ff9c01;
          }

          .node-ractangle__text {
            color: #f59500;
          }
        }
      }

      .bk-graph-node {
        cursor: default !important;

        &.mouse-hover {
          .node-ractangle__operations {
            display: block;
          }
        }
      }
    }

    .mission-minimap-popover {
      padding: 8px !important;
    }

    .mission-detail-status-box {
      display: flex;
      font-size: 12px;

      .mission-detail-status-info {
        .flex-center();

        margin-right: 24px;
      }

      .mission-detail-status-operate-button {
        padding: 5px 8px;
        border-radius: 50px;

        [class*='db-icon-'] {
          margin-right: 4px;
          font-size: 20px;
        }
      }
    }

    .task-history-fail-num-tip {
      display: inline-block;
      height: 22px;
      padding: 0 8px;
      font-size: 12px;
      line-height: 22px;
      color: #ea3536;
      cursor: pointer;
      background: #fee;
      border-radius: 11px;

      .number-display {
        height: 16px;
        padding: 0 5px;
        margin-left: 5px;
        line-height: 20px;
        color: #fff;
        background: #ea3636;
        border-radius: 8px;
      }
    }
  }
</style>
