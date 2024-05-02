import z from 'zod';

import {
  ConnectorType,
  NodeInputVariableSchema,
  NodeOutputVariableSchema,
} from '../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';
import { NodeConfigCommonSchema } from '../node-definition-base-types/node-config-common';

// Reference: https://huggingface.co/docs/api-inference/index

export const BingSearchApiNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Process).default(NodeKind.Process),
  type: z.literal(NodeType.BingSearchApi).default(NodeType.BingSearchApi),
});

export type BingSearchApiNodeInstanceLevelConfig = z.infer<
  typeof BingSearchApiNodeConfigSchema
>;

export type BingSearchApiNodeAccountLevelConfig = {
  bingSearchApiKey: string;
};

export type BingSearchApiNodeAllLevelConfig =
  BingSearchApiNodeInstanceLevelConfig & BingSearchApiNodeAccountLevelConfig;

export const BIND_SEARCH_API_NODE_DEFINITION: NodeDefinition<
  BingSearchApiNodeInstanceLevelConfig,
  BingSearchApiNodeAllLevelConfig
> = {
  type: NodeType.BingSearchApi,
  label: 'Bing Search API',

  configFields: [
    {
      type: FieldType.SharedCavnasConfig,
      attrName: 'bingSearchApiKey',
      canvasConfigKey: 'bingSearchApiKey',
    },
  ],

  fixedIncomingVariables: {
    query: {
      helperMessage: () => (
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

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'query',
    });

    const outputVariable = NodeOutputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'results',
    });

    const nodeConfig = BingSearchApiNodeConfigSchema.parse({
      nodeId,
      inputVariableIds: [inputVariable.id],
      outputVariableIds: [outputVariable.id],
    });

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        inputVariable,
        outputVariable,
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
      ],
    };
  },

  async runNode(params) {
    const { nodeConfig, inputVariableValues } = params;

    if (!nodeConfig.bingSearchApiKey) {
      return { errors: ['Bing Search API key is missing'] };
    }

    // SECTION: Main logic

    try {
      const params = new URLSearchParams([
        ['q', inputVariableValues[0] as string],
      ]);

      const response = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?${params.toString()}`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': nodeConfig.bingSearchApiKey,
          },
        },
      );

      const result = await response.json();

      return { variableValues: [result] };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return {
        errors: [err.message != null ? err.message : 'Unknown error'],
      };
    }

    // !SECTION
  },
};
