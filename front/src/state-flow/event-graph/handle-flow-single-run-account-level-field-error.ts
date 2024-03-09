import { AccountLevelValidationError } from 'flow-run/event-types';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type FlowSingleRunAccountLevelFieldErrorEvent = {
  type: ChangeEventType.FLOW_SINGLE_RUN_ACCOUNT_LEVEL_FIELD_ERROR;
  error: AccountLevelValidationError;
};

export const handleFlowSingleRunAccountLevelFieldError = createHandler<
  FlowSingleRunAccountLevelFieldErrorEvent,
  never
>(
  (event): event is FlowSingleRunAccountLevelFieldErrorEvent => {
    return (
      event.type === ChangeEventType.FLOW_SINGLE_RUN_ACCOUNT_LEVEL_FIELD_ERROR
    );
  },
  (state, event) => {
    const key = `${event.error.nodeType}:${event.error.fieldKey}`;

    state.flowContent.nodeAccountLevelFieldsValidationErrors[key] =
      event.error.message;

    return [];
  },
  [],
);
