import { PropType } from '@dhmk/utils';
import { Getter, Setter, createLens, lens } from '@dhmk/zustand-lens';
import { graphql } from 'gencode-gql';
import { client } from 'graphql-util/client';
import {
  RunMetadataTable,
  RunOutputTable,
  VariableIdToCsvColumnIndexMap,
} from 'state-flow/types';
import invariant from 'tiny-invariant';

export type BatchTestProperties = {
  csvModeSelectedPresetId: string | null;
  csvEvaluationIsLoading: boolean;

  csvString: string;

  config: {
    repeatTimes: number;
    concurrencyLimit: number;
    variableIdToCsvColumnIndexMap: VariableIdToCsvColumnIndexMap;
    runOutputTable: RunOutputTable;
    runMetadataTable: RunMetadataTable;
  };
};

export type BatchTestActions = {
  selectAndLoadPreset(presetId: string): Promise<void>;
  unselectPreset(): void;
  deleteAndUnselectPreset(): Promise<void>;
  createAndSelectPreset({ name }: { name: string }): Promise<void>;
  updateSelectedPreset({ name }: { name: string }): Promise<void>;
  savePresetConfigContentIfSelected(): Promise<void>;

  setCsvStr: Setter<string>;

  configActions: {
    setRepeatTimes: Setter<number>;
    setConcurrencyLimit: Setter<number>;
    setVariableIdToCsvColumnIndexMap: Setter<VariableIdToCsvColumnIndexMap>;
    setRunOutputTable: Setter<RunOutputTable>;
    setRunMetadataTable: Setter<RunMetadataTable>;
  };
};

export type BatchTestState = BatchTestProperties & BatchTestActions;

export function createBatchTestLens(getRoot: Getter<{ spaceId: string }>) {
  return lens<BatchTestState>((set, get) => {
    const [setConfig, getConfig] = createLens(set, get, 'config');

    return {
      csvModeSelectedPresetId: null,
      csvEvaluationIsLoading: false,

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

        setConfig(() =>
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

        setConfig(() => ({
          variableIdToCsvColumnIndexMap: {},
          runOutputTable: [],
          runMetadataTable: [],
        }));
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
        const configContent = getConfig();

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
        const configContent = getConfig();

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
        const configContent = getConfig();

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

      csvString: '',
      setCsvStr: createLens(set, get, 'csvString')[0],

      config: lens<PropType<BatchTestState, ['config']>>((set, get) => {
        return {
          repeatTimes: 1,
          concurrencyLimit: 2,
          variableIdToCsvColumnIndexMap: {},
          runOutputTable: [],
          runMetadataTable: [],
        };
      }),

      configActions: {
        setRepeatTimes: createLens(set, get, 'repeatTimes')[0],
        setConcurrencyLimit: createLens(set, get, 'concurrencyLimit')[0],
        setVariableIdToCsvColumnIndexMap: createLens(
          set,
          get,
          'variableIdToCsvColumnIndexMap',
        )[0],
        setRunOutputTable: createLens(set, get, 'runOutputTable')[0],
        setRunMetadataTable: createLens(set, get, 'runMetadataTable')[0],
      },
    };
  });
}
