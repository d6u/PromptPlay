import { Option } from "@mobily/ts-belt";
import { StateCreator } from "zustand";
import { client } from "../../state/urql";
import {
  CREATE_CSV_EVALUATION_PRESET_MUTATION,
  deleteCSVEvaluationPreset,
  queryCSVEvaluationPresetObservable,
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

  // Read
  csvEvaluationLoadPresetWithId(presetId: string | null): void;

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
  csvEvaluationSetCurrentPresetId(presetId: string | null): void {
    set({ csvEvaluationCurrentPresetId: presetId });
  },
  // csvEvaluationPresetConfigContent: {},
  csvEvaluationLoadPresetWithId(csvEvaluationPresetId: string | null): void {
    if (!csvEvaluationPresetId) {
      // TODO: cancel current loading request
      set({
        csvEvaluationCurrentPresetId: null,
        csvEvaluationCsvContent: "",
      });
      return;
    }

    set({
      csvEvaluationCurrentPresetId: csvEvaluationPresetId,
      csvEvaluationIsLoading: true,
    });

    const spaceId = get().spaceId!;

    console.log("csvEvaluationLoadPresetWithId 0");

    queryCSVEvaluationPresetObservable(
      spaceId,
      csvEvaluationPresetId
    ).subscribe({
      next({ csvContent, configContent }) {
        console.log("csvEvaluationLoadPresetWithId 1");
        set({
          csvEvaluationCsvContent: csvContent,
          // csvEvaluationPresetConfigContent: configContent,
        });
      },
      error(e) {
        console.error(e);
        set({ csvEvaluationIsLoading: false });
      },
      complete() {
        set({ csvEvaluationIsLoading: false });
      },
    });
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
