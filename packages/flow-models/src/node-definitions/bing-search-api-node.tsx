import { z } from 'zod';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';

// Reference: https://huggingface.co/docs/api-inference/index

export const BingSearchApiNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.Process),
  type: z.literal(NodeType.BingSearchApi),
  nodeId: z.string(),
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

  // accountLevelConfigFieldDefinitions: {
  //   bingSearchApiKey: {
  //     type: FieldType.Text,
  //     label: 'API key',
  //     placeholder: 'Enter API key here',
  //     helperMessage:
  //       "This is stored in your browser's local storage. Never uploaded.",
  //     schema: z.string().min(1, {
  //       message: 'API key is required',
  //     }),
  //   },
  // },

  configFields: [],

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

    return {
      nodeConfigs: [
        {
          kind: NodeKind.Process,
          nodeId: nodeId,
          type: NodeType.BingSearchApi,
        } as BingSearchApiNodeInstanceLevelConfig,
      ],
      connectors: [
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
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/query`,
          name: 'query',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/results`,
          name: 'results',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
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
