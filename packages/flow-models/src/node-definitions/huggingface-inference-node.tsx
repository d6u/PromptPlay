import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';
import * as HuggingFace from 'integrations/hugging-face';

import {
  ConnectorType,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
} from '../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../node-definition-base-types';

// Reference: https://huggingface.co/docs/api-inference/index

export const HuggingFaceInferenceNodeConfigSchema = z.object({
  type: z.literal(NodeType.HuggingFaceInference),
  nodeId: z.string(),
  model: z.string(),
});

export type HuggingFaceInferenceNodeInstanceLevelConfig = z.infer<
  typeof HuggingFaceInferenceNodeConfigSchema
>;

export type HuggingFaceInferenceNodeAccountLevelConfig = {
  huggingFaceApiToken: string;
};

export type HuggingFaceInferenceNodeAllLevelConfig =
  HuggingFaceInferenceNodeInstanceLevelConfig &
    HuggingFaceInferenceNodeAccountLevelConfig;

export const HUGGINGFACE_INFERENCE_NODE_DEFINITION: NodeDefinition<
  HuggingFaceInferenceNodeInstanceLevelConfig,
  HuggingFaceInferenceNodeAllLevelConfig
> = {
  type: NodeType.HuggingFaceInference,
  label: 'Hugging Face Inference',

  accountLevelConfigFieldDefinitions: {
    huggingFaceApiToken: {
      type: FieldType.Text,
      label: 'API Token',
      placeholder: 'Enter API key here',
      helperMessage:
        "This is stored in your browser's local storage. Never uploaded.",
      schema: z.string().min(1, {
        message: 'API Token is required',
      }),
    },
  },
  instanceLevelConfigFieldDefinitions: {
    model: {
      type: FieldType.Text,
      label: 'Model',
    },
  },

  fixedIncomingVariables: {
    parameters: {
      helperMessage: (
        <>
          Check Hugging Face's free{' '}
          <a
            href="https://huggingface.co/docs/api-inference/quicktour"
            target="_blank"
            rel="noreferrer"
          >
            Inference API documentation
          </a>{' '}
          for more information about the <code>parameters</code> input.
          Depending on the model you choose, you need to specify different
          parameters.
        </>
      ),
    },
  },

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        nodeId: nodeId,
        type: NodeType.HuggingFaceInference,
        model: 'gpt2',
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/parameters`,
          name: 'parameters',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Any,
          isGlobal: true,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/output`,
          name: 'output',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: true,
          globalVariableId: null,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
      ],
    };
  },

  createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
    return new Observable<NodeExecutionEvent>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap } = params;

      invariant(nodeConfig.type === NodeType.HuggingFaceInference);

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      if (!nodeConfig.huggingFaceApiToken) {
        subscriber.next({
          type: NodeExecutionEventType.Errors,
          nodeId: nodeConfig.nodeId,
          errorMessages: ['Hugging Face API token is missing'],
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
          return connector.type === ConnectorType.NodeInput;
        })
        .forEach((connector) => {
          argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
        });

      const variableOutput = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === ConnectorType.NodeOutput && conn.index === 0;
        },
      );

      invariant(variableOutput != null);

      // NOTE: Main logic

      HuggingFace.callInferenceApi(
        {
          apiToken: nodeConfig.huggingFaceApiToken,
          model: nodeConfig.model,
        },
        argsMap['parameters'],
      )
        .then((result) => {
          if (result.isError) {
            subscriber.next({
              type: NodeExecutionEventType.Errors,
              nodeId: nodeConfig.nodeId,
              errorMessages: [
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
            errorMessages: [
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
