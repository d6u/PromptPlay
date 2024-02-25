import { State } from '../event-types';

export const MOCK_STATE: State = {
  flowContent: {
    nodes: [],
    edges: [],
    nodeConfigsDict: {},
    variablesDict: {},
    variableValueLookUpDicts: [{}],
  },
  batchTestConfig: {
    repeatTimes: 1,
    concurrencyLimit: 2,
    variableIdToCsvColumnIndexMap: {},
    runOutputTable: [],
    runMetadataTable: [],
  },
};
