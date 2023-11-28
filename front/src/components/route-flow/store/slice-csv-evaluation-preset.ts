import { createLens } from "@dhmk/zustand-lens";
import { D, G, Option } from "@mobily/ts-belt";
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
  csvEvaluationCsvStr: string;
  csvEvaluationConfigContent: CsvEvaluationConfigContent;

  selectAndLoadPreset(presetId: string): Promise<void>;
  unselectPreset(): void;
  deleteAndUnselectPreset(): Promise<void>;

  csvEvaluationSetLocalCsvStr(csvStr: string): void;

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

  return {
    csvModeSelectedPresetId: null,
    csvEvaluationIsLoading: false,

    // Local data
    csvEvaluationCsvStr: "",
    csvEvaluationConfigContent: {
      repeatTimes: 1,
      concurrencyLimit: 2,
      variableIdToCsvColumnIndexLookUpDict: {},
      csvRunResultTable: [],
      runStatusTable: [],
    },

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
        csvEvaluationCsvStr: csvContent,
        csvEvaluationIsLoading: false,
      });

      setConfig(() =>
        configContent == null
          ? {
              variableIdToCsvColumnIndexLookUpDict: {},
              csvRunResultTable: [],
              runStatusTable: [],
            }
          : JSON.parse(configContent),
      );
    },
    unselectPreset(): void {
      set(() => ({
        csvModeSelectedPresetId: null,
        csvEvaluationCsvStr: "",
      }));

      setConfig(() => ({
        variableIdToCsvColumnIndexLookUpDict: {},
        csvRunResultTable: [],
        runStatusTable: [],
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

    csvEvaluationSetLocalCsvStr(csvStr: string): void {
      set({ csvEvaluationCsvStr: csvStr });
    },

    csvEvaluationSetRepeatCount(repeatTimes: number): void {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge<
          CsvEvaluationConfigContent,
          Partial<CsvEvaluationConfigContent>
        >(configContent, { repeatTimes }),
      });
    },
    csvEvaluationSetConcurrencyLimit(concurrencyLimit: number): void {
      const configContent = get().csvEvaluationConfigContent;
      set({
        csvEvaluationConfigContent: D.merge<
          CsvEvaluationConfigContent,
          Partial<CsvEvaluationConfigContent>
        >(configContent, { concurrencyLimit }),
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
              CsvEvaluationConfigContent,
              Partial<CsvEvaluationConfigContent>
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
            CsvEvaluationConfigContent,
            Partial<CsvEvaluationConfigContent>
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
      if (G.isFunction(update)) {
        set((state) => {
          const configContent = state.csvEvaluationConfigContent;
          return {
            csvEvaluationConfigContent: D.merge<
              CsvEvaluationConfigContent,
              Partial<CsvEvaluationConfigContent>
            >(configContent, {
              csvRunResultTable: update(configContent.csvRunResultTable),
            }),
          };
        });
      } else {
        const configContent = get().csvEvaluationConfigContent;
        set({
          csvEvaluationConfigContent: D.merge<
            CsvEvaluationConfigContent,
            Partial<CsvEvaluationConfigContent>
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
              CsvEvaluationConfigContent,
              Partial<CsvEvaluationConfigContent>
            >(configContent, {
              runStatusTable: update(configContent.runStatusTable),
            }),
          };
        });
      } else {
        const configContent = get().csvEvaluationConfigContent;
        set({
          csvEvaluationConfigContent: D.merge<
            CsvEvaluationConfigContent,
            Partial<CsvEvaluationConfigContent>
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
      const {
        spaceId,
        csvEvaluationCsvStr: csvContent,
        csvEvaluationConfigContent: configContent,
      } = get();

      if (spaceId) {
        const result = await client
          .mutation(CREATE_CSV_EVALUATION_PRESET_MUTATION, {
            spaceId,
            name,
            csvContent,
            configContent: JSON.stringify(configContent),
          })
          .toPromise();

        return result.data?.result?.csvEvaluationPreset;
      }
    },
    csvEvaluationPresetUpdate({ name }: { name: string }): void {
      const {
        csvModeSelectedPresetId: presetId,
        csvEvaluationCsvStr: csvContent,
        csvEvaluationConfigContent: configContent,
      } = get();

      if (presetId) {
        client
          .mutation(UPDATE_CSV_EVALUATION_PRESET_MUTATION, {
            presetId,
            name,
            csvContent,
            configContent: JSON.stringify(configContent),
          })
          .toPromise()
          .catch((error) => {
            console.error(error);
          });
      }
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
  variableIdToCsvColumnIndexLookUpDict: VariableIdToCsvColumnIndexLookUpDict;
  csvRunResultTable: CsvRunResultTable;
  runStatusTable: RunStatusTable;
};

export type RowIndex = number & { readonly "": unique symbol };
export type ColumnIndex = number & { readonly "": unique symbol };
export type IterationIndex = number & { readonly "": unique symbol };

export type VariableIdToCsvColumnIndexLookUpDict = Record<
  V3VariableID,
  ColumnIndex | null | undefined
>;

export type CsvRunResultTable = Record<
  RowIndex,
  Record<IterationIndex, V3VariableValueLookUpDict | undefined> | undefined
>;

export type RunStatusTable = Record<
  RowIndex,
  Record<IterationIndex, string | null>
>;

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
