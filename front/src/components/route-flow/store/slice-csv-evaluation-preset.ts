import { createLens, Getter, Setter } from "@dhmk/zustand-lens";
import invariant from "ts-invariant";
import { OperationResult } from "urql";
import { StateCreator } from "zustand";
import { graphql } from "../../../gql";
import { LoadCsvEvaluationPresetQuery } from "../../../gql/graphql";
import {
  V3VariableID,
  V3VariableValueLookUpDict,
} from "../../../models/v3-flow-content-types";
import { client } from "../../../state/urql";
import { FlowState } from "./store-flow-state-types";

export type CsvEvaluationPresetSlice = {
  csvModeSelectedPresetId: string | null;
  csvEvaluationIsLoading: boolean;

  // Persistable data
  csvStr: string;
  csvEvaluationConfigContent: CsvEvaluationConfigContent;

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
    "csvEvaluationConfigContent",
  );
  const [setVariableIdToCsvColumnIndexMap, getVariableIdToCsvColumnIndexMap] =
    createLens(setConfig, getConfig, "variableIdToCsvColumnIndexMap");
  const [setRunOutputTable, getRunOutputTable] = createLens(
    setConfig,
    getConfig,
    "runOutputTable",
  );
  const [setRunMetadataTable, getRunMetadataTable] = createLens(
    setConfig,
    getConfig,
    "runMetadataTable",
  );

  return {
    csvModeSelectedPresetId: null,
    csvEvaluationIsLoading: false,

    // Local data
    csvStr: "",
    csvEvaluationConfigContent: {
      repeatTimes: 1,
      concurrencyLimit: 2,
      variableIdToCsvColumnIndexMap: {},
      runOutputTable: [],
      runMetadataTable: [],
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
        console.error("Preset not found");
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
        csvStr: "",
      }));

      setConfig(() => ({
        variableIdToCsvColumnIndexMap: {},
        runOutputTable: [],
        runMetadataTable: [],
      }));
    },
    async deleteAndUnselectPreset(): Promise<void> {
      const presetId = get().csvModeSelectedPresetId;
      invariant(presetId != null, "Preset ID should not be null");

      await client
        .mutation(DELETE_CSV_EVALUATION_PRESET_MUTATION, {
          presetId,
        })
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
        .mutation(CREATE_CSV_EVALUATION_PRESET_MUTATION, {
          spaceId,
          name,
          csvContent,
          configContent: JSON.stringify(configContent),
        })
        .toPromise();

      const presetId = result.data?.result?.csvEvaluationPreset?.id;
      invariant(presetId != null, "Preset ID should not be null");

      get().selectAndLoadPreset(presetId);
    },
    async updateSelectedPreset({ name }: { name: string }): Promise<void> {
      const {
        csvModeSelectedPresetId: presetId,
        csvStr: csvContent,
        csvEvaluationConfigContent: configContent,
      } = get();

      invariant(presetId != null, "Preset ID should not be null");

      await client
        .mutation(UPDATE_CSV_EVALUATION_PRESET_MUTATION, {
          presetId,
          name,
          csvContent,
          configContent: JSON.stringify(configContent),
        })
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

export type RowIndex = number & { readonly "": unique symbol };
export type ColumnIndex = number & { readonly "": unique symbol };
export type IterationIndex = number & { readonly "": unique symbol };

export type VariableIdToCsvColumnIndexMap = Record<
  V3VariableID,
  ColumnIndex | null | undefined
>;

export type RunOutputTable = Record<
  RowIndex,
  Record<IterationIndex, V3VariableValueLookUpDict | undefined> | undefined
>;

export type RunMetadataTable = Record<
  RowIndex,
  Record<IterationIndex, RunMetadata | undefined> | undefined
>;

export type RunMetadata = {
  overallStatus: OverallStatus;
  errors: string[];
};

export enum OverallStatus {
  NotStarted = "NotStarted",
  Waiting = "Waiting",
  Running = "Running",
  // NOTE: Don't call this success because it might not be fully successful
  Complete = "Complete",
  // NOTE: Don't call this error because it might be canceled by the user
  Interrupted = "Interrupted",
  Unknown = "Unknown",
}

// SECTION: GraphQL

const CREATE_CSV_EVALUATION_PRESET_MUTATION = graphql(`
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
`);

const UPDATE_CSV_EVALUATION_PRESET_MUTATION = graphql(`
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
`);

const DELETE_CSV_EVALUATION_PRESET_MUTATION = graphql(`
  mutation DeleteCsvEvaluationPresetMutation($presetId: ID!) {
    space: deleteCsvEvaluationPreset(id: $presetId) {
      id
      csvEvaluationPresets {
        id
      }
    }
  }
`);

// !SECTION
