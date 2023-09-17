import { StateCreator } from "zustand";
import {
  createCSVEvaluationPreset,
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
  csvEvaluationPresetCreate(name: string): Promise<void>;
  csvEvaluationPresetUpdate(): void;
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
  async csvEvaluationPresetCreate(name: string): Promise<void> {
    const { spaceId, csvEvaluationPresetCsvContent } = get();

    if (spaceId) {
      await createCSVEvaluationPreset(
        spaceId,
        name,
        csvEvaluationPresetCsvContent
      );
    }
  },
  csvEvaluationPresetUpdate(): void {
    const { csvEvaluationPresetId: presetId, csvEvaluationPresetCsvContent } =
      get();

    if (presetId) {
      updateCSVEvaluationPreset(presetId, csvEvaluationPresetCsvContent).catch(
        (e) => {
          console.error(e);
        }
      );
    }
  },
});
