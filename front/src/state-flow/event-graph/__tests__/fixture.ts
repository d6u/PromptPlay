import { State } from '../event-types';

export const MOCK_STATE: State = {
  flowContent: {
    nodes: [],
    edges: [],
    nodeConfigsDict: {},
    variablesDict: {},
    variableValueLookUpDicts: [{}],
    nodeExecutionStates: {},
    nodeAccountLevelFieldsValidationErrors: {},
    globalVariables: {},
  },
};
