import { createLens, Getter, Setter } from '@dhmk/zustand-lens';
import invariant from 'tiny-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';

import { ConnectorResultMap } from 'flow-models';

import { RunMetadata } from 'flow-run/run-types';
import { graphql } from 'gencode-gql';
import { LoadCsvEvaluationPresetQuery } from 'gencode-gql/graphql';
import { client } from 'graphql-util/client';

import { BatchTestTab, FlowState } from './types';

export type CsvEvaluationPresetState = {
  selectedBatchTestTab: BatchTestTab;

  csvModeSelectedPresetId: string | null;
  csvEvaluationIsLoading: boolean;

  // Persistable data
  csvStr: string;
  csvEvaluationConfigContent: CsvEvaluationConfigContent;
};

export type CsvEvaluationPresetSlice = CsvEvaluationPresetState & {
  setSelectedBatchTestTab(tab: BatchTestTab): void;

  setCsvStr(csvStr: string): void;
  setRepeatTimes(repeatTimes: number): void;
  getRepeatTimes(): number;
  setConcurrencyLimit(concurrencyLimit: number): void;
  getConcurrencyLimit(): number;
  setVariableIdToCsvColumnIndexMap: Setter<VariableIdToCsvColumnIndexMap>;
  getVariableIdToCsvColumnIndexMap: Getter<VariableIdToCsvColumnIndexMap>;
  setRunOutputTable: Setter<RunOutputTable>;
  getRunOutputTable: Getter<RunOutputTable>;
  setRunMetadataTable: Setter<RunMetadataTable>;
  getRunMetadataTable: Getter<RunMetadataTable>;

  selectAndLoadPreset(presetId: string): Promise<void>;
  unselectPreset(): void;
  deleteAndUnselectPreset(): Promise<void>;
  createAndSelectPreset({ name }: { name: string }): Promise<void>;
  updateSelectedPreset({ name }: { name: string }): Promise<void>;
  savePresetConfigContentIfSelected(): Promise<void>;
};

export const createCsvEvaluationPresetSlice: StateCreator<
  FlowState,
  [],
  [],
  CsvEvaluationPresetSlice
> = (set, get) => {
  const [setConfig, getConfig] = createLens(
    set,
    get,
    'csvEvaluationConfigContent',
  );
  const [setVariableIdToCsvColumnIndexMap, getVariableIdToCsvColumnIndexMap] =
    createLens(setConfig, getConfig, 'variableIdToCsvColumnIndexMap');
  const [setRunOutputTable, getRunOutputTable] = createLens(
    setConfig,
    getConfig,
    'runOutputTable',
  );
  const [setRunMetadataTable, getRunMetadataTable] = createLens(
    setConfig,
    getConfig,
    'runMetadataTable',
  );

  return {
    selectedBatchTestTab: BatchTestTab.RunTests,

    csvModeSelectedPresetId: null,
    csvEvaluationIsLoading: false,

    // Local data
    csvStr: '',
    csvEvaluationConfigContent: {
      repeatTimes: 1,
      concurrencyLimit: 2,
      variableIdToCsvColumnIndexMap: {},
      runOutputTable: [],
      runMetadataTable: [],
    },

    setSelectedBatchTestTab(tab: BatchTestTab): void {
      set({ selectedBatchTestTab: tab });
    },

    setCsvStr(csvStr: string): void {
      set({ csvStr });
    },
    setRepeatTimes(repeatTimes: number): void {
      setConfig(() => ({ repeatTimes }));
    },
    getRepeatTimes(): number {
      return getConfig().repeatTimes;
    },
    setConcurrencyLimit(concurrencyLimit: number): void {
      setConfig(() => ({ concurrencyLimit }));
    },
    getConcurrencyLimit(): number {
      return getConfig().concurrencyLimit;
    },
    setVariableIdToCsvColumnIndexMap,
    getVariableIdToCsvColumnIndexMap,
    setRunOutputTable,
    getRunOutputTable,
    setRunMetadataTable,
    getRunMetadataTable,

    async selectAndLoadPreset(presetId: string): Promise<void> {
      set({
        csvModeSelectedPresetId: presetId,
        csvEvaluationIsLoading: true,
      });

      const result = await loadPreset(get().spaceId, presetId);

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

      set({
        csvStr: csvContent,
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
      set(() => ({
        csvModeSelectedPresetId: null,
        csvStr: '',
      }));

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
      const {
        spaceId,
        csvStr: csvContent,
        csvEvaluationConfigContent: configContent,
      } = get();

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
      const {
        csvModeSelectedPresetId: presetId,
        csvStr: csvContent,
        csvEvaluationConfigContent: configContent,
      } = get();

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
      const {
        csvModeSelectedPresetId: presetId,
        csvEvaluationConfigContent: configContent,
      } = get();

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
};

// SECTION: Utilitiy Functions

async function loadPreset(
  spaceId: string,
  presetId: string,
): Promise<OperationResult<LoadCsvEvaluationPresetQuery>> {
  return await client
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
        spaceId,
        presetId,
      },
    )
    .toPromise();
}

// !SECTION

export type CsvEvaluationConfigContent = {
  repeatTimes: number;
  concurrencyLimit: number;
  variableIdToCsvColumnIndexMap: VariableIdToCsvColumnIndexMap;
  runOutputTable: RunOutputTable;
  runMetadataTable: RunMetadataTable;
};

export type RowIndex = number & { readonly '': unique symbol };
export type ColumnIndex = number & { readonly '': unique symbol };
export type IterationIndex = number & { readonly '': unique symbol };

export type VariableIdToCsvColumnIndexMap = Record<
  string,
  ColumnIndex | null | undefined
>;

export type RunOutputTable = Record<
  RowIndex,
  Record<IterationIndex, ConnectorResultMap | undefined> | undefined
>;

export type RunMetadataTable = Record<
  RowIndex,
  Record<IterationIndex, RunMetadata | undefined> | undefined
>;
