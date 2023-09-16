import { StateCreator } from "zustand";
import { FlowServerSlice } from "./storeFlowServerSlice";

export type CsvEvaluationPresetSlice = {
  isLoading: boolean;
};

export const createCsvEvaluationPresetSlice: StateCreator<
  FlowServerSlice,
  [],
  [],
  CsvEvaluationPresetSlice
> = (set, get) => ({
  isLoading: false,
});
