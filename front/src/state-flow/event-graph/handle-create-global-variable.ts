import randomId from 'common-utils/randomId';
import { ConnectorType, VariableValueType } from 'flow-models';

import invariant from 'tiny-invariant';
import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type CreateGlobalVariableEvent = {
  type: ChangeEventType.CREATE_GLOBAL_VARIABLE;
  name: string;
  assignToVariableId: string;
};

export const handleCreateGlobalVariable = createHandler<
  CreateGlobalVariableEvent,
  never
>(
  (event): event is CreateGlobalVariableEvent => {
    return event.type === ChangeEventType.CREATE_GLOBAL_VARIABLE;
  },
  (state, event) => {
    const globalVariableId = randomId();

    invariant(
      Object.values(state.flowContent.globalVariables).find(
        (globalVariable) => globalVariable.name === event.name,
      ) == null,
      'Global variable name is unique',
    );

    state.flowContent.globalVariables[globalVariableId] = {
      id: globalVariableId,
      name: event.name,
      valueType: VariableValueType.Unknown,
    };

    const variable = state.flowContent.variablesDict[event.assignToVariableId];

    invariant(
      variable.type == ConnectorType.NodeInput ||
        variable.type == ConnectorType.NodeOutput,
      'Variable must be of type NodeInput or NodeOutput',
    );

    invariant(variable.isGlobal, 'Variable must be global');

    variable.globalVariableId = globalVariableId;

    return [];
  },
  [],
);
