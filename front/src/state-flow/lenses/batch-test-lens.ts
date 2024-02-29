import { Getter, Setter, createLens, lens } from '@dhmk/zustand-lens';
import invariant from 'tiny-invariant';

import { graphql } from 'gencode-gql';
import { client } from 'graphql-util/client';

import { PropType } from '@dhmk/utils';
import {
  RunMetadataTable,
  RunOutputTable,
  VariableIdToCsvColumnIndexMap,
} from '../types';

export type BatchTestState = {
  csvModeSelectedPresetId: string | null;
  csvEvaluationIsLoading: boolean;
  csvString: string;

  config: {
    content: {
      repeatTimes: number;
      concurrencyLimit: number;
      variableIdToCsvColumnIndexMap: VariableIdToCsvColumnIndexMap;
      runOutputTable: RunOutputTable;
      runMetadataTable: RunMetadataTable;
    };
  };
};

export type BatchTestActions = {
  setCsvStr: Setter<string>;

  config: {
    setRepeatTimes: Setter<number>;
    setConcurrencyLimit: Setter<number>;
    setVariableIdToCsvColumnIndexMap: Setter<VariableIdToCsvColumnIndexMap>;
    setRunOutputTable: Setter<RunOutputTable>;
    setRunMetadataTable: Setter<RunMetadataTable>;
  };

  selectAndLoadPreset(presetId: string): Promise<void>;
  unselectPreset(): void;
  deleteAndUnselectPreset(): Promise<void>;
  createAndSelectPreset({ name }: { name: string }): Promise<void>;
  updateSelectedPreset({ name }: { name: string }): Promise<void>;
  savePresetConfigContentIfSelected(): Promise<void>;
};

export type BatchTestShape = BatchTestState & BatchTestActions;

export function createBatchTestLens(getRoot: Getter<{ spaceId: string }>) {
  return lens<BatchTestShape>((set, get) => {
    const [setConfigContent, getConfigContent] = createLens(set, get, [
      'config',
      'content',
    ]);

    return {
      csvModeSelectedPresetId: null,
      csvEvaluationIsLoading: false,
      csvString: '',

      setCsvStr: createLens(set, get, 'csvString')[0],

      config: lens<PropType<BatchTestShape, ['config']>>((set, get) => {
        return {
          content: {
            repeatTimes: 1,
            concurrencyLimit: 2,
            variableIdToCsvColumnIndexMap: {},
            runOutputTable: [],
            runMetadataTable: [],
          },

          setRepeatTimes: createLens(set, get, ['content', 'repeatTimes'])[0],
          setConcurrencyLimit: createLens(set, get, [
            'content',
            'concurrencyLimit',
          ])[0],
          setVariableIdToCsvColumnIndexMap: createLens(set, get, [
            'content',
            'variableIdToCsvColumnIndexMap',
          ])[0],
          setRunOutputTable: createLens(set, get, [
            'content',
            'runOutputTable',
          ])[0],
          setRunMetadataTable: createLens(set, get, [
            'content',
            'runMetadataTable',
          ])[0],
        };
      }),

      async selectAndLoadPreset(presetId: string): Promise<void> {
        set({
          csvModeSelectedPresetId: presetId,
          csvEvaluationIsLoading: true,
        });

        const result = await client
          .query(
            graphql(`
              query LoadCsvEvaluationPreset($spaceId: UUID!, $presetId: ID!) {
                result: space(id: $spaceId) {
                  space {
                    id
                    csvEvaluationPreset(id: $presetId) {
                      id
                      csvContent
                      configContent
                    }
                  }
                }
              }
            `),
            {
              spaceId: getRoot().spaceId,
              presetId,
            },
          )
          .toPromise();

        if (result.error) {
          console.error(result.error);
          return;
        }

        const preset = result.data?.result?.space?.csvEvaluationPreset;

        if (preset == null) {
          console.error('Preset not found');
          return;
        }

        const { csvContent, configContent } = preset;

        get().setCsvStr(csvContent);

        set({
          csvEvaluationIsLoading: false,
        });

        setConfigContent(
          configContent == null
            ? {
                variableIdToCsvColumnIndexMap: {},
                runOutputTable: [],
                runMetadataTable: [],
              }
            : JSON.parse(configContent),
        );
      },

      unselectPreset(): void {
        set({
          csvModeSelectedPresetId: null,
          csvString: '',
        });

        setConfigContent({
          variableIdToCsvColumnIndexMap: {},
          runOutputTable: [],
          runMetadataTable: [],
        });
      },

      async deleteAndUnselectPreset(): Promise<void> {
        const presetId = get().csvModeSelectedPresetId;
        invariant(presetId != null, 'Preset ID should not be null');

        await client
          .mutation(
            graphql(`
              mutation DeleteCsvEvaluationPresetMutation($presetId: ID!) {
                space: deleteCsvEvaluationPreset(id: $presetId) {
                  id
                  csvEvaluationPresets {
                    id
                  }
                }
              }
            `),
            {
              presetId,
            },
          )
          .toPromise();

        get().unselectPreset();
      },

      async createAndSelectPreset({ name }: { name: string }): Promise<void> {
        const spaceId = getRoot().spaceId;
        const csvContent = get().csvString;
        const configContent = getConfigContent();

        const result = await client
          .mutation(
            graphql(`
              mutation CreateCsvEvaluationPresetMutation(
                $spaceId: ID!
                $name: String!
                $csvContent: String
                $configContent: String
              ) {
                result: createCsvEvaluationPreset(
                  spaceId: $spaceId
                  name: $name
                  csvContent: $csvContent
                  configContent: $configContent
                ) {
                  space {
                    id
                    csvEvaluationPresets {
                      id
                    }
                  }
                  csvEvaluationPreset {
                    id
                    name
                    csvContent
                    configContent
                  }
                }
              }
            `),
            {
              spaceId,
              name,
              csvContent,
              configContent: JSON.stringify(configContent),
            },
          )
          .toPromise();

        const presetId = result.data?.result?.csvEvaluationPreset?.id;
        invariant(presetId != null, 'Preset ID should not be null');

        get().selectAndLoadPreset(presetId);
      },

      async updateSelectedPreset({ name }: { name: string }): Promise<void> {
        const presetId = get().csvModeSelectedPresetId;
        const csvContent = get().csvString;
        const configContent = get();

        invariant(presetId != null, 'Preset ID should not be null');

        await client
          .mutation(
            graphql(`
              mutation UpdateCsvEvaluationPresetMutation(
                $presetId: ID!
                $name: String
                $csvContent: String
                $configContent: String
              ) {
                updateCsvEvaluationPreset(
                  presetId: $presetId
                  name: $name
                  csvContent: $csvContent
                  configContent: $configContent
                ) {
                  id
                  name
                  csvContent
                  configContent
                }
              }
            `),
            {
              presetId,
              name,
              csvContent,
              configContent: JSON.stringify(configContent),
            },
          )
          .toPromise();
      },

      async savePresetConfigContentIfSelected(): Promise<void> {
        const presetId = get().csvModeSelectedPresetId;
        const configContent = getConfigContent();

        if (presetId == null) {
          return;
        }

        await client
          .mutation(
            graphql(`
              mutation SavePresetConfigContent(
                $presetId: ID!
                $configContent: String!
              ) {
                updateCsvEvaluationPreset(
                  presetId: $presetId
                  configContent: $configContent
                ) {
                  id
                  configContent
                }
              }
            `),
            {
              presetId,
              configContent: JSON.stringify(configContent),
            },
          )
          .toPromise();
      },
    };
  });
}
