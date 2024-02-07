import { createLens } from '@dhmk/zustand-lens';
import { D } from '@mobily/ts-belt';
import { create, StateCreator } from 'zustand';

import { createSelectors } from 'generic-util/zustand';

// TODO: Introduce feedback types: ERROR, WARNING, INFO, SUCCESS
// Currently all feedbacks are ERROR

type NodeFieldFeedbackState = {
  fieldFeedbacks: Record<string, string[]>;
  hasAnyFeedbacks: () => boolean;
  getFieldFeedbacks: (nodeId: string, key: string) => string[];
  setFieldFeedbacks: (nodeId: string, key: string, feedbacks: string[]) => void;
  removeFieldFeedbacks: (nodeId: string, key: string) => void;
  clearFieldFeedbacks: () => void;
};

const stateCreator: StateCreator<
  NodeFieldFeedbackState,
  [],
  [],
  NodeFieldFeedbackState
> = (set, get) => {
  function getKey(nodeId: string, key: string) {
    return `${nodeId}:${key}`;
  }
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
          return fieldFeedbacksGet()[key].length > 0;
        });
      } else {
        return false;
      }
    },
    getFieldFeedbacks: (nodeId: string, key: string): string[] => {
      const feedbacks = fieldFeedbacksGet()[getKey(nodeId, key)] as
        | string[]
        | undefined;
      return feedbacks ?? [];
    },
    setFieldFeedbacks: (
      nodeId: string,
      key: string,
      feedbacks: string[],
    ): void => {
      fieldFeedbacksSet((state) => {
        return D.set(state, getKey(nodeId, key), feedbacks);
      });
    },
    removeFieldFeedbacks: (nodeId: string, key: string): void => {
      fieldFeedbacksSet((state) => {
        return D.deleteKey(state, getKey(nodeId, key));
      });
    },
    clearFieldFeedbacks: (): void => {
      fieldFeedbacksSet(() => ({}), true);
    },
  };
};

export const useNodeFieldFeedbackStore = createSelectors(
  create<NodeFieldFeedbackState>()(stateCreator),
);
