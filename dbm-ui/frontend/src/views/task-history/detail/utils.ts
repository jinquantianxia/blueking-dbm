import _ from 'lodash';

import { getTaskflowDetails } from '@services/source/taskflow';

import { random } from '@utils';

import { type Group, Rect as GRect, Text as GText } from '@antv/g';
import { Badge, CommonEvent, iconfont, Label, Rect } from '@antv/g6';

type TaskflowDetails = ServiceReturnType<typeof getTaskflowDetails>;

const style = document.createElement('style');
style.innerHTML = `@import url('${iconfont.css}');`;
document.head.appendChild(style);

const COLORS = {
  B: '#1783FF',
  DI: '#A7A7A7',
  G: '#60C42D',
  R: '#F46649',
  Y: '#DB9D0D',
};
const GREY_COLOR = '#CED4D9';

export class TreeNode extends Rect {
  get childrenData() {
    return this.context.model.getChildrenData(this.id);
  }

  get data() {
    return this.context.model.getNodeLikeDatum(this.id);
  }

  drawCollapseShape(attributes: any, container: any) {
    if (!this.data.pipeline) return false;
    const collapseStyle = this.getCollapseStyle(attributes) as any;
    const btn = this.upsert('collapse', Badge, collapseStyle, container);

    // if (btn && !Reflect.has(btn, '__bind__')) {
    //   Reflect.set(btn, '__bind__', true);
    //   btn.addEventListener(CommonEvent.CLICK, () => {
    //     const { collapsed } = this.attributes;
    //     const graph = this.context.graph;
    //     if (collapsed) graph.expandElement(this.id);
    //     else graph.collapseElement(this.id);
    //   });
    // }
  }

  // drawCurrencyShape(attributes: any, container: any) {
  //   const currencyStyle = this.getCurrencyStyle(attributes) as any;
  //   this.upsert('currency', GText, currencyStyle, container);
  // }

  // drawPercentShape(attributes: any, container: any) {
  //   const percentStyle = this.getPercentStyle(attributes) as any;
  //   this.upsert('percent', GText, percentStyle, container);
  // }

  // drawPriceShape(attributes: any, container: any) {
  //   const priceStyle = this.getPriceStyle(attributes) as any;
  //   this.upsert('price', GText, priceStyle, container);
  // }

  // drawProcessBarShape(attributes: any, container: any) {
  //   const processBarStyle = this.getProcessBarStyle(attributes);
  //   this.upsert('process-bar', GRect, processBarStyle, container);
  // }

  // drawTriangleShape(attributes: any, container: any) {
  //   const triangleStyle = this.getTriangleStyle(attributes) as any;
  //   this.upsert('triangle', Label, triangleStyle, container);
  // }

  drawVariableShape(attributes: any, container: any) {
    const variableStyle = this.getVariableStyle(attributes) as any;
    this.upsert('variable', GText, variableStyle, container);
  }

  getCollapseStyle(attributes: any) {
    if (!this.data.pipeline) return false;
    const { collapsed } = attributes;
    const [width, height] = this.getSize(attributes);
    return {
      backgroundFill: '#fff',
      backgroundHeight: 16,
      backgroundLineWidth: 1,
      backgroundRadius: 0,
      backgroundStroke: GREY_COLOR,
      backgroundWidth: 16,
      cursor: 'pointer',
      fill: GREY_COLOR,
      fontSize: 16,
      text: collapsed ? '+' : '-',
      textAlign: 'center',
      textBaseline: 'middle',
      x: width / 2,
      y: 0,
    };
  }

  // getCurrencyStyle(attributes: any) {
  //   const [, height] = this.getSize(attributes);
  //   return {
  //     fill: '#000',
  //     fontSize: 12,
  //     opacity: 0.75,
  //     text: this.data.currency,
  //     x: this.shapeMap['price'].getLocalBounds().max[0] + 4,
  //     y: height / 2 - 8,
  //   };
  // }

  getKeyStyle(attributes: any) {
    const keyStyle = super.getKeyStyle(attributes);
    return {
      ...keyStyle,
      fill: '#fff',
      lineWidth: 1,
      stroke: GREY_COLOR,
    };
  }

  getLabelStyle(attributes: any) {
    const [width, height] = this.getSize(attributes);
    return {
      cursor: 'pointer',
      fill: '#000',
      fontSize: 12,
      opacity: 0.85,
      text: this.data.name as any,
      x: -width / 2 + 8,
      y: -height / 2 + 16,
    };
  }

  // getPercentStyle(attributes: any) {
  //   const [width, height] = this.getSize(attributes);
  //   return {
  //     fill: COLORS[this.data.status],
  //     fontSize: 12,
  //     text: `${((Number(this.data.variableValue) || 0) * 100).toFixed(2)}%`,
  //     textAlign: 'right',
  //     x: width / 2 - 4,
  //     y: height / 2 - 8,
  //   };
  // }

  // getPriceStyle(attributes: any) {
  //   const [width, height] = this.getSize(attributes);
  //   return {
  //     fill: '#000',
  //     fontSize: 16,
  //     opacity: 0.85,
  //     text: this.data.label,
  //     x: -width / 2 + 8,
  //     y: height / 2 - 8,
  //   };
  // }

  // getProcessBarStyle(attributes: any) {
  //   const { rate, status } = this.data;
  //   const { radius } = attributes;
  //   const color = COLORS[status];
  //   const percent = `${Number(rate) * 100}%`;
  //   const [width, height] = this.getSize(attributes);
  //   return {
  //     fill: `linear-gradient(to right, ${color} ${percent}, ${GREY_COLOR} ${percent})`,
  //     height: 4,
  //     radius: [0, 0, radius, radius],
  //     width: width,
  //     x: -width / 2,
  //     y: height / 2 - 4,
  //   };
  // }

  // getTriangleStyle(attributes: any) {
  //   // const percentMinX = this.shapeMap['percent'].getLocalBounds().min[0];
  //   const percentMinX = 0;
  //   const [, height] = this.getSize(attributes);
  //   return {
  //     fill: COLORS[this.data.status],
  //     fontFamily: 'iconfont',
  //     fontSize: 16,
  //     text: '\ue62d',
  //     transform: this.data.variableUp ? [] : [['rotate', 180]],
  //     x: this.data.variableUp ? percentMinX - 18 : percentMinX,
  //     y: height / 2 - 16,
  //   };
  // }

  getVariableStyle(attributes: any) {
    const [, height] = this.getSize(attributes);
    return {
      fill: '#000',
      fontSize: 12,
      opacity: 0.45,
      text: this.data.variableName,
      textAlign: 'right',
      // x: this.shapeMap['triangle'].getLocalBounds().min[0] - 4,
      x: 0,
      y: height / 2 - 8,
    };
  }

  render(attributes = this.parsedAttributes as any, container: Group) {
    super.render(attributes, container);

    // this.drawPriceShape(attributes, container);
    // this.drawCurrencyShape(attributes, container);
    // this.drawPercentShape(attributes, container);
    // this.drawTriangleShape(attributes, container);
    // this.drawVariableShape(attributes, container);
    // this.drawProcessBarShape(attributes, container);
    this.drawCollapseShape(attributes, container);
  }
}

export function dataTransform(data: TaskflowDetails) {
  const traverse = (list: TaskflowDetails['activities'][string][]) => {
    list.forEach((item) => {
      if (item.pipeline) {
        Object.assign(item, {
          children: Object.values(item.pipeline.activities),
        });
      }

      if (item.children) {
        traverse(item.children);
      }
    });
    return list;
  };

  const children = traverse(Object.values(data.activities));
  const treeData: Node = {
    children,
    id: data.start_event.id,
    name: '开始',
  };

  return treeData;
}

export type Node = TaskflowDetails['activities'][string];

interface Edge {
  id: string;
  source: string;
  target: string;
}

export function activitesFlatenToNodes(data: TaskflowDetails) {
  const nodes: Node[] = [];
  // 存在子流程的时候，子流程的起点对应与父级节点id的映射，包含最外层的结束节点
  const startEventIdToNodeMap: Record<string, string> = {};

  const traverse = (list: Node[] = []) => {
    list.forEach((item) => {
      nodes.push(item);
      if (item.pipeline) {
        startEventIdToNodeMap[item.pipeline.start_event.id] = item.id;
        traverse(Object.values(item.pipeline.activities));
      }
    });
    return list;
  };

  traverse(Object.values(data.activities));
  const startNode = {
    id: data.start_event.id,
    name: '开始',
  };
  const endNode = {
    id: data.end_event.id,
    name: '结束',
  };
  startEventIdToNodeMap[data.start_event.id] = startNode.id;
  startEventIdToNodeMap[data.end_event.id] = endNode.id;
  console.log('nodes = ', nodes.length);
  return {
    // nodes: [...nodes, startNode, endNode],
    startEventIdToNodeMap,
  };
}

export function generateEdges(baseData: TaskflowDetails, startEventIdToNodeMap: Record<string, string>) {
  // console.log('startEventIdToNodeMap = ', startEventIdToNodeMap);
  // 全部节点id映射，用于快速确定边线的source和target
  // const nodeMap = nodes.reduce<Record<string, boolean>>((dataMap, item) => {
  //   Object.assign(dataMap, {
  //     [item.id]: true,
  //   });
  //   return dataMap;
  // }, {});

  const calcSourceNode = (id: string, data: TaskflowDetails) => {
    if (data.activities[id] || data.gateways[id]) {
      // 直接命中节点或者命中汇聚节点
      return id;
    }

    if (data.start_event.id === id) {
      // 命中开始节点，开始节点可能是子流程的开始节点
      return startEventIdToNodeMap[id];
    }

    if (data.end_event.id === id) {
      // 命中结束节点，只能命中最外层的，内部的结束节点会是undefined之后要忽略
      return startEventIdToNodeMap[id];
    }

    if (data.flows[id]) {
      // 命中flow，可能要反复跳转到gateway或者其他flow直至节点id
      const sourceId = data.flows[id].source;
      return calcSourceNode(sourceId, data);
    }
  };

  const calcTargetNode = (id: string, data: TaskflowDetails) => {
    if (data.activities[id] || data.gateways[id]) {
      // 直接命中节点或者命中汇聚节点
      return id;
    }

    if (data.start_event.id === id) {
      // 命中开始节点，开始节点可能是子流程的开始节点
      return startEventIdToNodeMap[id];
    }

    if (data.end_event.id === id) {
      // 命中结束节点，只能命中最外层的，内部的结束节点会是undefined之后要忽略
      return startEventIdToNodeMap[id];
    }

    if (data.flows[id]) {
      // 命中flow，可能要反复跳转到gateway或者其他flow直至节点id
      const targetId = data.flows[id].target;
      return calcTargetNode(targetId, data);
    }
  };

  const edgesMap: Record<string, Set<string>> = {};

  const traverse = (data: TaskflowDetails) => {
    if (Object.keys(data.flows).length) {
      const flowValueList = Object.values(data.flows);
      flowValueList.forEach((item) => {
        const sourceIdOrList = calcSourceNode(item.source, data);
        const targetIdOrList = calcTargetNode(item.target, data);

        if (!sourceIdOrList || !targetIdOrList) {
          return;
        }
        const sourceList = Array.isArray(sourceIdOrList) ? _.flatMapDeep(sourceIdOrList) : [sourceIdOrList];
        const targetList = Array.isArray(targetIdOrList) ? _.flatMapDeep(targetIdOrList) : [targetIdOrList];
        if (sourceList.length && targetList.length) {
          sourceList.forEach((source) => {
            targetList.forEach((target) => {
              if (edgesMap[source]) {
                edgesMap[source].add(target);
              } else {
                Object.assign(edgesMap, {
                  [source]: new Set([target]),
                });
              }
            });
          });
          return;
        }
      });
    }

    Object.values(data.activities).forEach((activity) => {
      if (activity.pipeline) {
        traverse(activity.pipeline);
      }
    });
  };

  traverse(baseData);
  // const isChecked = edges.every((edge) => nodeMap[edge.source] && nodeMap[edge.target]);
  // console.log('isChecked = ', isChecked);

  console.log('edgesMap=', edgesMap);
  const edges: Edge[] = [];
  Object.entries(edgesMap).forEach(([source, targetSet]) => {
    targetSet?.forEach((target) => {
      edges.push({
        id: random(),
        source,
        target,
      });
    });
  });
  // console.log('proxyIdMap=', proxyIdMap);

  // return edgeList;
  return edges;
}

export function getCurrentNodeChildenDataAndEdges(
  data: TaskflowDetails,
  totalEdges: Edge[],
  currentNodeId = '',
  isOuter = true,
) {
  const baseNodes = [
    ...Object.values(data.activities),
    ...Object.values(data.gateways).map((item) => ({ ...item, name: '网关节点' })),
  ];
  const nodes = isOuter
    ? [
        ...baseNodes,
        {
          id: data.start_event.id,
          name: '开始',
        },
        {
          id: data.end_event.id,
          name: '结束',
        },
      ]
    : baseNodes;

  const nodesMap = nodes.reduce<Record<string, boolean>>((dataMap, item) => {
    Object.assign(dataMap, {
      [item.id]: true,
    });
    return dataMap;
  }, {});
  const edges = totalEdges.reduce<Edge[]>((list, edge) => {
    if (nodesMap[edge.source] && nodesMap[edge.target]) {
      list.push(edge);
      return list;
    }
    if (!isOuter) {
      if (edge.source === currentNodeId) {
        list.push(edge);
      }
    }
    return list;
  }, []);

  return {
    edges,
    nodes,
  };
}
