import randomId from 'common-utils/randomId';
import { VariableValueType } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type CreateGlobalVariableEvent = {
  type: ChangeEventType.CREATE_GLOBAL_VARIABLE;
  name: string;
};

export const handleCreateGlobalVariable = createHandler<
  CreateGlobalVariableEvent,
  never
>(
  (event): event is CreateGlobalVariableEvent => {
    return event.type === ChangeEventType.CREATE_GLOBAL_VARIABLE;
  },
  (state, event) => {
    const id = randomId();

    state.flowContent.globalVariables[id] = {
      id,
      name: event.name,
      valueType: VariableValueType.Unknown,
    };

    return [];
  },
  [],
);
