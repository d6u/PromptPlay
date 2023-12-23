import * as HuggingFace from 'integrations/hugging-face';
import { Observable, defer, endWith, from, map, of, startWith } from 'rxjs';
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

// Reference: https://huggingface.co/docs/api-inference/index

export const HUGGINGFACE_INFERENCE_NODE_DEFINITION: NodeDefinition = {
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
      ],
    };
  },

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.HuggingFaceInference);

    const {
      variablesDict: variableMap,
      edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
      outputIdToValueMap: variableValueMap,
      huggingFaceApiToken,
    } = context;

    // ANCHOR: Prepare inputs

    if (!huggingFaceApiToken) {
      return of<NodeExecutionEvent>({
        type: NodeExecutionEventType.Errors,
        nodeId: nodeConfig.nodeId,
        errMessages: ['Hugging Face API token is missing'],
      });
    }

    let variableOutput: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

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
          variableOutput = variable;
        }
      }
    }

    invariant(variableOutput != null);

    return defer<Observable<NodeExecutionEvent>>(() => {
      // ANCHOR: Execute logic

      return from(
        HuggingFace.callInferenceApi(
          { apiToken: huggingFaceApiToken, model: nodeConfig.model },
          argsMap['parameters'],
        ),
      ).pipe(
        map((result): NodeExecutionEvent => {
          if (result.isError) {
            if (result.data) {
              throw result.data;
            } else {
              throw new Error('Unknown error');
            }
          }

          invariant(variableOutput != null);

          variableValueMap[variableOutput.id] = result.data;

          return {
            type: NodeExecutionEventType.VariableValues,
            nodeId: nodeConfig.nodeId,
            variableValuesLookUpDict: {
              [variableOutput.id]: result.data,
            },
          };
        }),
      );
    }).pipe(
      startWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      }),
      endWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: [variableOutput.id],
      }),
    );
  },
};
