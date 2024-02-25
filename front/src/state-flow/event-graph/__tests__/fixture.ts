import { BatchTestTab } from 'state-flow/types';
import { State } from '../event-types';

export const MOCK_STATE: State = {
  // Persist to server
  nodes: [],
  edges: [],
  nodeConfigsDict: {},
  variablesDict: {},
  variableValueLookUpDicts: [{}],
  // Local
  isFlowContentDirty: false,
  isFlowContentSaving: false,

  selectedBatchTestTab: BatchTestTab.RunTests,

  csvModeSelectedPresetId: null,
  csvEvaluationIsLoading: false,

  // Local data
  csvStr: '',
  csvEvaluationConfigContent: {
    repeatTimes: 1,
    concurrencyLimit: 2,
    variableIdToCsvColumnIndexMap: {},
    runOutputTable: [],
    runMetadataTable: [],
  },
};
