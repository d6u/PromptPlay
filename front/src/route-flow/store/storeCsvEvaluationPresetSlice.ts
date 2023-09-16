import { StateCreator } from "zustand";
import {
  queryCSVEvaluationPresetObservable,
  updateCSVEvaluationPreset,
} from "./flowGraphql";
import { FlowState } from "./flowStore";

export type CsvEvaluationPresetSlice = {
  csvEvaluationPresetId: string | null;
  csvEvaluationPresetIsLoading: boolean;
  csvEvaluationPresetCsvContent: string;
  // csvEvaluationPresetConfigContent: unknown;
  csvEvaluationPresetSetAndLoadPreset(presetId: string | null): void;
  csvEvaluationPresetSetCsvContent(csvContent: string): void;
  csvEvaluationPresetSetSave(): void;
};

export const createCsvEvaluationPresetSlice: StateCreator<
  FlowState,
  [],
  [],
  CsvEvaluationPresetSlice
> = (set, get) => ({
  csvEvaluationPresetId: null,
  csvEvaluationPresetIsLoading: false,
  csvEvaluationPresetCsvContent: "",
  // csvEvaluationPresetConfigContent: {},
  csvEvaluationPresetSetAndLoadPreset(
    csvEvaluationPresetId: string | null
  ): void {
    if (!csvEvaluationPresetId) {
      // TODO: cancel current loading request
      set({
        csvEvaluationPresetId: null,
        csvEvaluationPresetCsvContent: "",
      });
      return;
    }

    set({
      csvEvaluationPresetId,
      csvEvaluationPresetIsLoading: true,
    });

    const spaceId = get().spaceId!;

    queryCSVEvaluationPresetObservable(
      spaceId,
      csvEvaluationPresetId
    ).subscribe({
      next({ csvContent, configContent }) {
        set({
          csvEvaluationPresetCsvContent: csvContent,
          // csvEvaluationPresetConfigContent: configContent,
        });
      },
      error(e) {
        console.error(e);
        set({ csvEvaluationPresetIsLoading: false });
      },
      complete() {
        set({ csvEvaluationPresetIsLoading: false });
      },
    });
  },
  csvEvaluationPresetSetCsvContent(csvContent: string): void {
    set({ csvEvaluationPresetCsvContent: csvContent });
  },
  csvEvaluationPresetSetSave(): void {
    const presetId = get().csvEvaluationPresetId;

    if (!presetId) {
      return;
    }

    updateCSVEvaluationPreset(
      presetId,
      get().csvEvaluationPresetCsvContent
    ).catch((e) => {
      console.error(e);
    });
  },
});
