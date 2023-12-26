import randomId from 'common-utils/randomId';
import * as HuggingFace from 'integrations/hugging-face';
import Joi from 'joi';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/NodeDefinition';
import {
  NodeInputVariable,
  NodeOutputVariable,
  VariableType,
  VariableValueType,
} from '../base/connector-types';
import { NodeID } from '../base/id-types';
import { asV3VariableID } from '../base/v3-flow-utils';
import NodeType from './NodeType';

// Reference: https://huggingface.co/docs/api-inference/index

export type V3HuggingFaceInferenceNodeConfig = {
  type: NodeType.HuggingFaceInference;
  nodeId: NodeID;
  model: string;
};

export const HuggingFaceInferenceNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.HuggingFaceInference),
  nodeId: Joi.string().required(),
});

export const HUGGINGFACE_INFERENCE_NODE_DEFINITION: NodeDefinition<V3HuggingFaceInferenceNodeConfig> =
  {
    nodeType: NodeType.HuggingFaceInference,

    isEnabledInToolbar: true,
    toolbarLabel: 'Hugging Face Inference',

    createDefaultNodeConfig: (node) => {
      return {
        nodeConfig: {
          nodeId: node.id,
          type: NodeType.HuggingFaceInference,
          model: 'gpt2',
        },
        variableConfigList: [
          {
            type: VariableType.NodeInput,
            id: asV3VariableID(`${node.id}/parameters`),
            name: 'parameters',
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableType.NodeOutput,
            id: asV3VariableID(`${node.id}/output`),
            name: 'output',
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableType.ConditionTarget,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
          },
        ],
      };
    },

    createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
      return new Observable<NodeExecutionEvent>((subscriber) => {
        const { nodeConfig, connectorList } = nodeExecutionConfig;
        const { nodeInputValueMap, huggingFaceApiToken } = params;

        invariant(nodeConfig.type === NodeType.HuggingFaceInference);

        subscriber.next({
          type: NodeExecutionEventType.Start,
          nodeId: nodeConfig.nodeId,
        });

        if (!huggingFaceApiToken) {
          subscriber.next({
            type: NodeExecutionEventType.Errors,
            nodeId: nodeConfig.nodeId,
            errMessages: ['Hugging Face API token is missing'],
          });

          subscriber.next({
            type: NodeExecutionEventType.Finish,
            nodeId: nodeConfig.nodeId,
            finishedConnectorIds: [],
          });

          subscriber.complete();
          return;
        }

        const argsMap: Record<string, unknown> = {};

        connectorList
          .filter((connector): connector is NodeInputVariable => {
            return connector.type === VariableType.NodeInput;
          })
          .forEach((connector) => {
            argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
          });

        const variableOutput = connectorList.find(
          (conn): conn is NodeOutputVariable => {
            return conn.type === VariableType.NodeOutput && conn.index === 0;
          },
        );

        invariant(variableOutput != null);

        // NOTE: Main logic

        HuggingFace.callInferenceApi(
          {
            apiToken: huggingFaceApiToken,
            model: nodeConfig.model,
          },
          argsMap['parameters'],
        )
          .then((result) => {
            if (result.isError) {
              subscriber.next({
                type: NodeExecutionEventType.Errors,
                nodeId: nodeConfig.nodeId,
                errMessages: [
                  result.data != null
                    ? JSON.stringify(result.data)
                    : 'Unknown error',
                ],
              });

              subscriber.next({
                type: NodeExecutionEventType.Finish,
                nodeId: nodeConfig.nodeId,
                finishedConnectorIds: [],
              });
            } else {
              subscriber.next({
                type: NodeExecutionEventType.VariableValues,
                nodeId: nodeConfig.nodeId,
                variableValuesLookUpDict: {
                  [variableOutput.id]: result.data,
                },
              });

              subscriber.next({
                type: NodeExecutionEventType.Finish,
                nodeId: nodeConfig.nodeId,
                finishedConnectorIds: [variableOutput.id],
              });
            }
          })
          .catch((err) => {
            subscriber.next({
              type: NodeExecutionEventType.Errors,
              nodeId: nodeConfig.nodeId,
              errMessages: [
                err.message != null ? err.message : 'Unknown error',
              ],
            });

            subscriber.next({
              type: NodeExecutionEventType.Finish,
              nodeId: nodeConfig.nodeId,
              finishedConnectorIds: [],
            });
          })
          .finally(() => {
            subscriber.complete();
          });
      });
    },
  };
