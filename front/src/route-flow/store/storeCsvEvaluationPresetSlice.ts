import { Option } from "@mobily/ts-belt";
import { StateCreator } from "zustand";
import { client } from "../../state/urql";
import {
  CREATE_CSV_EVALUATION_PRESET_MUTATION,
  deleteCSVEvaluationPreset,
  updateCSVEvaluationPreset,
} from "./flowGraphql";
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
  csvEvaluationDeleteCurrentPreset(): void;

  csvEvaluationPresetUpdate(): void;
};

export const createCsvEvaluationPresetSlice: StateCreator<
  FlowState,
  [],
  [],
  CsvEvaluationPresetSlice
> = (set, get) => ({
  csvEvaluationCurrentPresetId: null,
  csvEvaluationIsLoading: false,
  csvEvaluationCsvContent: "",
  // csvEvaluationPresetConfigContent: {},
  csvEvaluationSetCurrentPresetId(presetId: string | null): void {
    set({ csvEvaluationCurrentPresetId: presetId });
  },
  csvEvaluationSetLocalCsvContent(csvContent: string): void {
    set({ csvEvaluationCsvContent: csvContent });
  },
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
  csvEvaluationPresetUpdate(): void {
    const {
      csvEvaluationCurrentPresetId: presetId,
      csvEvaluationCsvContent: csvEvaluationPresetCsvContent,
    } = get();

    if (presetId) {
      updateCSVEvaluationPreset(presetId, csvEvaluationPresetCsvContent).catch(
        (e) => {
          console.error(e);
        }
      );
    }
  },
  csvEvaluationDeleteCurrentPreset(): void {
    const { csvEvaluationCurrentPresetId: presetId } = get();

    if (presetId) {
      deleteCSVEvaluationPreset(presetId).catch((e) => {
        console.error(e);
      });
    }
  },
});
