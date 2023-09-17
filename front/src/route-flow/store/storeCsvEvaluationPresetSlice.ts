import { Option } from "@mobily/ts-belt";
import { StateCreator } from "zustand";
import { graphql } from "../../gql";
import { client } from "../../state/urql";
import { FlowState } from "./flowStore";

export type CsvEvaluationPresetSlice = {
  csvEvaluationCurrentPresetId: string | null;
  csvEvaluationIsLoading: boolean;

  // Local data that maps to server data
  csvEvaluationCsvContent: string;
  // csvEvaluationPresetConfigContent: unknown;

  csvEvaluationSetCurrentPresetId(presetId: string | null): void;
  csvEvaluationSetLocalCsvContent(csvContent: string): void;

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
  // csvEvaluationPresetConfigContent: {},

  csvEvaluationSetCurrentPresetId(presetId: string | null): void {
    set({ csvEvaluationCurrentPresetId: presetId });
  },
  csvEvaluationSetLocalCsvContent(csvContent: string): void {
    set({ csvEvaluationCsvContent: csvContent });
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
