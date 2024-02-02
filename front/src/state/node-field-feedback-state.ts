import { createLens } from '@dhmk/zustand-lens';
import { D } from '@mobily/ts-belt';
import { ReactNode } from 'react';
import { create, StateCreator } from 'zustand';
import { createSelectors } from '../utils/zustand-utils';

type NodeFieldFeedbackState = {
  fieldFeedbacks: Record<string, Record<string, ReactNode>>;
  getFieldFeedbacks: (key: string) => ReactNode[];
  setFieldFeedback: (
    key: string,
    messageKey: string,
    feedback: ReactNode,
  ) => void;
  removeFieldFeedback: (key: string, messageKey: string) => void;
  removeFieldAllFeedbacks: (key: string) => void;
};

const stateCreator: StateCreator<
  NodeFieldFeedbackState,
  [],
  [],
  NodeFieldFeedbackState
> = (set, get) => {
  const [fieldFeedbacksSet, fieldFeedbacksGet] = createLens(
    set,
    get,
    'fieldFeedbacks',
  );

  return {
    fieldFeedbacks: {},
    getFieldFeedbacks: (key: string): ReactNode[] => {
      const feedbackMap = fieldFeedbacksGet()[key] as
        | Record<string, ReactNode>
        | undefined;
      return feedbackMap ? D.values(feedbackMap) : [];
    },
    setFieldFeedback: (
      key: string,
      messageKey: string,
      feedback: ReactNode,
    ): void => {
      fieldFeedbacksSet((state) => {
        if (state[key]) {
          return D.updateUnsafe(state, key, D.set(messageKey, feedback));
        } else {
          return D.set(state, key, { [messageKey]: feedback });
        }
      });
    },
    removeFieldFeedback: (key: string, messageKey: string): void => {
      fieldFeedbacksSet((state) => {
        if (state[key]) {
          return D.updateUnsafe(state, key, D.deleteKey(messageKey));
        } else {
          return state;
        }
      });
    },
    removeFieldAllFeedbacks: (key: string): void => {
      fieldFeedbacksSet((state) => {
        return D.deleteKey(state, key);
      });
    },
  };
};

export const useNodeFieldFeedbackStore = createSelectors(
  create<NodeFieldFeedbackState>()(stateCreator),
);
