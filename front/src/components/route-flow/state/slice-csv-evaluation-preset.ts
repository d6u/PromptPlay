import { D, G, Option } from "@mobily/ts-belt";
import { StateCreator } from "zustand";
import { graphql } from "../../../gql";
import {
  V3VariableID,
  V3VariableValueLookUpDict,
} from "../../../models/v3-flow-content-types";
import { client } from "../../../state/urql";
import { FlowState } from "./store-flow-state-types";

export type CsvEvaluationPresetSlice = {
  csvEvaluationCurrentPresetId: string | null;
  csvEvaluationIsLoading: boolean;

  // Local data
  csvEvaluationCsvStr: string;
  csvEvaluationConfigContent: ConfigContent;

  csvEvaluationSetCurrentPresetId(presetId: string | null): void;
  csvEvaluationSetLocalCsvStr(csvStr: string): void;

  csvEvaluationSetLocalConfigContent(
    change: Partial<ConfigContent> | null,
  ): void;
  csvEvaluationSetRepeatCount(repeatCount: number): void;
  csvEvaluationSetConcurrencyLimit(concurrencyLimit: number): void;
  csvEvaluationSetVariableIdToCsvColumnIndexLookUpDict(
    update:
      | ((
          prev: VariableIdToCsvColumnIndexLookUpDict,
        ) => VariableIdToCsvColumnIndexLookUpDict)
      | VariableIdToCsvColumnIndexLookUpDict,
  ): void;
  csvEvaluationSetGeneratedResult(
    update:
      | ((prev: CsvRunResultTable) => CsvRunResultTable)
      | CsvRunResultTable,
  ): void;
  csvEvaluationSetRunStatuses(
    update: ((prev: RunStatusTable) => RunStatusTable) | RunStatusTable,
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

  // Local data
  csvEvaluationCsvStr: "",
  csvEvaluationConfigContent: DEFAULT_CONFIG_CONTENT,

  csvEvaluationSetCurrentPresetId(presetId: string | null): void {
    set({ csvEvaluationCurrentPresetId: presetId });
  },
  csvEvaluationSetLocalCsvStr(csvStr: string): void {
    set({ csvEvaluationCsvStr: csvStr });
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
  csvEvaluationSetVariableIdToCsvColumnIndexLookUpDict(
    update:
      | ((
          prev: VariableIdToCsvColumnIndexLookUpDict,
        ) => VariableIdToCsvColumnIndexLookUpDict)
      | VariableIdToCsvColumnIndexLookUpDict,
  ): void {
    if (G.isFunction(update)) {
      set((state) => {
        const configContent = state.csvEvaluationConfigContent;
        return {
          csvEvaluationConfigContent: D.merge<
            ConfigContent,
            Partial<ConfigContent>
          >(configContent, {
            variableIdToCsvColumnIndexLookUpDict: update(
              configContent.variableIdToCsvColumnIndexLookUpDict,
            ),
          }),
        };
      });
    } else {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge<
          ConfigContent,
          Partial<ConfigContent>
        >(configContent, {
          variableIdToCsvColumnIndexLookUpDict: update,
        }),
      });
    }
  },
  csvEvaluationSetGeneratedResult(
    update:
      | ((prev: CsvRunResultTable) => CsvRunResultTable)
      | CsvRunResultTable,
  ): void {
    console.log("csvEvaluationSetGeneratedResult", update);
    if (G.isFunction(update)) {
      set((state) => {
        const configContent = state.csvEvaluationConfigContent;
        return {
          csvEvaluationConfigContent: D.merge<
            ConfigContent,
            Partial<ConfigContent>
          >(configContent, {
            csvRunResultTable: update(configContent.csvRunResultTable),
          }),
        };
      });
    } else {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge<
          ConfigContent,
          Partial<ConfigContent>
        >(configContent, {
          csvRunResultTable: update,
        }),
      });
    }
  },
  csvEvaluationSetRunStatuses(
    update: ((prev: RunStatusTable) => RunStatusTable) | RunStatusTable,
  ) {
    if (G.isFunction(update)) {
      set((state) => {
        const configContent = state.csvEvaluationConfigContent;
        return {
          csvEvaluationConfigContent: D.merge<
            ConfigContent,
            Partial<ConfigContent>
          >(configContent, {
            runStatusTable: update(configContent.runStatusTable),
          }),
        };
      });
    } else {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge<
          ConfigContent,
          Partial<ConfigContent>
        >(configContent, {
          runStatusTable: update,
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
    const { spaceId, csvEvaluationCsvStr: csvContent } = get();

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
      csvEvaluationCsvStr: csvContent,
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

type ConfigContent = {
  repeatTimes: number;
  concurrencyLimit: number;
  variableIdToCsvColumnIndexLookUpDict: VariableIdToCsvColumnIndexLookUpDict;
  csvRunResultTable: CsvRunResultTable;
  runStatusTable: RunStatusTable;
};

export type RowIndex = number & { readonly "": unique symbol };
export type ColumnIndex = number & { readonly "": unique symbol };
export type IterationIndex = number & { readonly "": unique symbol };

export type VariableIdToCsvColumnIndexLookUpDict = Record<
  V3VariableID,
  ColumnIndex | null
>;

export type CsvRunResultTable = Record<
  RowIndex,
  Record<IterationIndex, V3VariableValueLookUpDict>
>;

export type RunStatusTable = Record<
  RowIndex,
  Record<IterationIndex, string | null>
>;

const DEFAULT_CONFIG_CONTENT: ConfigContent = {
  repeatTimes: 1,
  concurrencyLimit: 2,
  variableIdToCsvColumnIndexLookUpDict: {},
  csvRunResultTable: [],
  runStatusTable: [],
};

// SECTION: GraphQL

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

// !SECTION
