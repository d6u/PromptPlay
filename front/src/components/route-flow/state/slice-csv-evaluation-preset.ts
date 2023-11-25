import { D, G, Option } from "@mobily/ts-belt";
import { StateCreator } from "zustand";
import { FlowOutputVariableMap } from "../../../flow-run";
import { graphql } from "../../../gql";
import { VariableID } from "../../../models/v2-flow-content-types";
import { client } from "../../../state/urql";
import { FlowState } from "./store-flow-state-types";

type ConfigContent = {
  repeatCount: number;
  concurrencyLimit: number;
  variableColumnMap: VariableColumnMap;
  generatedResult: GeneratedResult;
  runStatuses: RunStatuses;
};

const DEFAULT_CONFIG_CONTENT: ConfigContent = {
  repeatCount: 1,
  concurrencyLimit: 2,
  variableColumnMap: {},
  generatedResult: [],
  runStatuses: [],
};

export type RowIndex = number & { readonly "": unique symbol };
export type ColumnIndex = number & { readonly "": unique symbol };

export type VariableColumnMap = Record<VariableID, ColumnIndex | null>;

export type GeneratedResult = Record<
  RowIndex,
  Record<ColumnIndex, FlowOutputVariableMap>
>;

export type RunStatuses = Record<RowIndex, Record<ColumnIndex, string | null>>;

export type CsvEvaluationPresetSlice = {
  csvEvaluationCurrentPresetId: string | null;
  csvEvaluationIsLoading: boolean;

  // Local data that maps to server data
  csvEvaluationCsvContent: string;
  csvEvaluationConfigContent: ConfigContent;

  csvEvaluationSetCurrentPresetId(presetId: string | null): void;
  csvEvaluationSetLocalCsvContent(csvContent: string): void;

  csvEvaluationSetLocalConfigContent(
    change: Partial<ConfigContent> | null,
  ): void;
  csvEvaluationSetRepeatCount(repeatCount: number): void;
  csvEvaluationSetConcurrencyLimit(concurrencyLimit: number): void;
  csvEvaluationSetVariableColumnMap(
    update:
      | ((prev: VariableColumnMap) => VariableColumnMap)
      | VariableColumnMap,
  ): void;
  csvEvaluationSetGeneratedResult(
    update: ((prev: GeneratedResult) => GeneratedResult) | GeneratedResult,
  ): void;
  csvEvaluationSetRunStatuses(
    update: ((prev: RunStatuses) => RunStatuses) | RunStatuses,
  ): void;

  // Write
  csvEvaluationSaveNewPreset({
    name,
  }: {
    name: string;
  }): Promise<Option<{ id: string }>>;
  csvEvaluationPresetUpdate({ name }: { name: string }): void;
  csvEvaluationDeleteCurrentPreset(): void;
};

export const createCsvEvaluationPresetSlice: StateCreator<
  FlowState,
  [],
  [],
  CsvEvaluationPresetSlice
> = (set, get) => ({
  csvEvaluationCurrentPresetId: null,
  csvEvaluationIsLoading: false,

  // Local data that maps to server data
  csvEvaluationCsvContent: "",
  csvEvaluationConfigContent: DEFAULT_CONFIG_CONTENT,

  csvEvaluationSetCurrentPresetId(presetId: string | null): void {
    set({ csvEvaluationCurrentPresetId: presetId });
  },
  csvEvaluationSetLocalCsvContent(csvContent: string): void {
    set({ csvEvaluationCsvContent: csvContent });
  },

  csvEvaluationSetLocalConfigContent(
    change: Partial<ConfigContent> | null,
  ): void {
    if (change) {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge(configContent, change),
      });
    } else {
      set({ csvEvaluationConfigContent: DEFAULT_CONFIG_CONTENT });
    }
  },
  csvEvaluationSetRepeatCount(repeatCount: number): void {
    const configContent = get().csvEvaluationConfigContent;
    set({
      csvEvaluationConfigContent: D.merge(configContent, { repeatCount }),
    });
  },
  csvEvaluationSetConcurrencyLimit(concurrencyLimit: number): void {
    const configContent = get().csvEvaluationConfigContent;
    set({
      csvEvaluationConfigContent: D.merge(configContent, { concurrencyLimit }),
    });
  },
  csvEvaluationSetVariableColumnMap(
    update:
      | ((prev: VariableColumnMap) => VariableColumnMap)
      | VariableColumnMap,
  ): void {
    if (G.isFunction(update)) {
      set((state) => {
        const configContent = state.csvEvaluationConfigContent;
        return {
          csvEvaluationConfigContent: D.merge(configContent, {
            variableColumnMap: update(configContent.variableColumnMap),
          }),
        };
      });
    } else {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge(configContent, {
          variableColumnMap: update,
        }),
      });
    }
  },
  csvEvaluationSetGeneratedResult(
    update: ((prev: GeneratedResult) => GeneratedResult) | GeneratedResult,
  ): void {
    if (G.isFunction(update)) {
      set((state) => {
        const configContent = state.csvEvaluationConfigContent;
        return {
          csvEvaluationConfigContent: D.merge(configContent, {
            generatedResult: update(configContent.generatedResult),
          }),
        };
      });
    } else {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge(configContent, {
          generatedResult: update,
        }),
      });
    }
  },
  csvEvaluationSetRunStatuses(
    update: ((prev: RunStatuses) => RunStatuses) | RunStatuses,
  ) {
    if (G.isFunction(update)) {
      set((state) => {
        const configContent = state.csvEvaluationConfigContent;
        return {
          csvEvaluationConfigContent: D.merge(configContent, {
            runStatuses: update(configContent.runStatuses),
          }),
        };
      });
    } else {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge(configContent, {
          runStatuses: update,
        }),
      });
    }
  },

  // Write
  async csvEvaluationSaveNewPreset({
    name,
  }: {
    name: string;
  }): Promise<Option<{ id: string }>> {
    const { spaceId, csvEvaluationCsvContent: csvContent } = get();

    if (spaceId) {
      const result = await client
        .mutation(CREATE_CSV_EVALUATION_PRESET_MUTATION, {
          spaceId,
          name,
          csvContent,
        })
        .toPromise();

      return result.data?.result?.csvEvaluationPreset;
    }
  },
  csvEvaluationPresetUpdate({ name }: { name: string }): void {
    const {
      csvEvaluationCurrentPresetId: presetId,
      csvEvaluationCsvContent: csvContent,
    } = get();

    if (presetId) {
      client
        .mutation(UPDATE_CSV_EVALUATION_PRESET_MUTATION, {
          presetId,
          name,
          csvContent,
        })
        .toPromise()
        .catch((e) => {
          console.error(e);
        });
    }
  },
  csvEvaluationDeleteCurrentPreset(): void {
    const { csvEvaluationCurrentPresetId: presetId } = get();

    if (presetId) {
      client
        .mutation(DELETE_CSV_EVALUATION_PRESET_MUTATION, {
          presetId,
        })
        .toPromise()
        .catch((e) => {
          console.error(e);
        });
    }
  },
});

const CREATE_CSV_EVALUATION_PRESET_MUTATION = graphql(`
  mutation CreateCsvEvaluationPresetMutation(
    $spaceId: ID!
    $name: String!
    $csvContent: String
  ) {
    result: createCsvEvaluationPreset(
      spaceId: $spaceId
      name: $name
      csvContent: $csvContent
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
  ) {
    updateCsvEvaluationPreset(
      presetId: $presetId
      name: $name
      csvContent: $csvContent
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
