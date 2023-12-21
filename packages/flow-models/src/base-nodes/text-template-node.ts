import randomId from 'common-utils/randomId';
import mustache from 'mustache';
import { defer, of } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
  NodeOutputVariable,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const TEXT_TEMPLATE_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.TextTemplate,

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.TextTemplate,
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      variableConfigList: [
        {
          type: VariableType.NodeInput,
          id: asV3VariableID(`${node.id}/${randomId()}`),
          name: 'topic',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/content`),
          name: 'content',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
        },
      ],
    };
  },

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.TextTemplate);

    const {
      variablesDict: variableMap,
      edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
      outputIdToValueMap: variableValueMap,
    } = context;

    return defer(() => {
      // ANCHOR: Prepare inputs

      let variableContent: NodeOutputVariable | null = null;

      const argsMap: Record<string, unknown> = {};

      for (const variable of Object.values(variableMap)) {
        if (variable.nodeId !== nodeConfig.nodeId) {
          continue;
        }

        if (variable.type === VariableType.NodeInput) {
          const outputId = inputIdToOutputIdMap[variable.id];

          if (outputId) {
            const outputValue = variableValueMap[outputId];
            argsMap[variable.name] = outputValue ?? null;
          } else {
            argsMap[variable.name] = null;
          }
        } else if (variable.type === VariableType.NodeOutput) {
          if (variable.index === 0) {
            variableContent = variable;
          }
        }
      }

      invariant(variableContent != null);

      // ANCHOR: Execute logic

      const content = mustache.render(nodeConfig.content, argsMap);

      // ANCHOR: Update outputs

      variableValueMap[variableContent.id] = content;

      return of<NodeExecutionEvent[]>(
        {
          type: NodeExecutionEventType.Start,
          nodeId: nodeConfig.nodeId,
        },
        {
          type: NodeExecutionEventType.VariableValues,
          nodeId: nodeConfig.nodeId,
          variableValuesLookUpDict: {
            [variableContent.id]: content,
          },
        },
        {
          type: NodeExecutionEventType.Finish,
          nodeId: nodeConfig.nodeId,
        },
      );
    });
  },
};
