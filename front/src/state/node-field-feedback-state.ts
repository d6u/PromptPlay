import { createLens } from '@dhmk/zustand-lens';
import { D } from '@mobily/ts-belt';
import { createSelectors } from 'generic-util/zustand-utils';
import { ReactNode } from 'react';
import { create, StateCreator } from 'zustand';

// TODO: Introduce feedback types: ERROR, WARNING, INFO, SUCCESS
// Currently all feedbacks are ERROR

type NodeFieldFeedbackState = {
  fieldFeedbacks: Record<string, Record<string, ReactNode>>;
  hasAnyFeedbacks: () => boolean;
  getFieldFeedbacks: (key: string) => ReactNode[];
  setSingleFieldFeedback: (
    key: string,
    messageKey: string,
    feedback: ReactNode,
  ) => void;
  setFieldFeedbacks: (
    key: string,
    feedbacks: Record<string, ReactNode>,
  ) => void;
  removeSingleFieldFeedback: (key: string, messageKey: string) => void;
  removeFieldFeedbacks: (key: string) => void;
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
    hasAnyFeedbacks: (): boolean => {
      const keys = D.keys(fieldFeedbacksGet());
      if (keys.length) {
        return keys.some((key) => {
          return get().getFieldFeedbacks(key).length > 0;
        });
      } else {
        return false;
      }
    },
    getFieldFeedbacks: (key: string): ReactNode[] => {
      const feedbackMap = fieldFeedbacksGet()[key] as
        | Record<string, ReactNode>
        | undefined;
      return feedbackMap ? D.values(feedbackMap) : [];
    },
    setSingleFieldFeedback: (
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
    setFieldFeedbacks: (
      key: string,
      feedbacks: Record<string, ReactNode>,
    ): void => {
      fieldFeedbacksSet((state) => {
        return D.set(state, key, feedbacks);
      });
    },
    removeSingleFieldFeedback: (key: string, messageKey: string): void => {
      fieldFeedbacksSet((state) => {
        if (state[key]) {
          return D.updateUnsafe(state, key, D.deleteKey(messageKey));
        } else {
          return state;
        }
      });
    },
    removeFieldFeedbacks: (key: string): void => {
      fieldFeedbacksSet((state) => {
        return D.deleteKey(state, key);
      });
    },
  };
};

export const useNodeFieldFeedbackStore = createSelectors(
  create<NodeFieldFeedbackState>()(stateCreator),
);
