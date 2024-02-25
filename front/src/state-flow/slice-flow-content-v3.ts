import { StateCreator } from 'zustand';

import { FlowState, SliceFlowContentV3State } from './types';

const FLOW_SERVER_SLICE_INITIAL_STATE_V2: SliceFlowContentV3State = {
  // Persist to server
  // nodes: [],
  // edges: [],
  // nodeConfigsDict: {},
  // variablesDict: {},
  // variableValueLookUpDicts: [{}],
  // Local
  isFlowContentDirty: false,
  isFlowContentSaving: false,
};

type SliceFlowContentV3Actions = {};

export type SliceFlowContentV3 = SliceFlowContentV3State &
  SliceFlowContentV3Actions;

export const createFlowServerSliceV3: StateCreator<
  FlowState,
  [['zustand/devtools', never]],
  [],
  SliceFlowContentV3
> = (set, get) => {
  // function processEventWithEventGraph(event: AcceptedEvent) {
  //   // let isDirty = false;
  //   // set(
  //   //   (state) => {
  //   //     const nextState = produce(get(), (draft) => {
  //   //       handleAllEvent(draft, event);
  //   //     });
  //   //     isDirty = nextState !== state;
  //   //     return nextState;
  //   //   },
  //   //   false,
  //   //   event,
  //   // );
  //   // if (isDirty) {
  //   //   const spaceId = get().spaceId;
  //   //   invariant(spaceId != null);
  //   //   saveSpaceDebounced(spaceId, {
  //   //     nodes: get().nodes,
  //   //     edges: get().edges,
  //   //     nodeConfigsDict: get().nodeConfigsDict,
  //   //     variablesDict: get().variablesDict,
  //   //     variableValueLookUpDicts: get().variableValueLookUpDicts,
  //   //   });
  //   // }
  // }

  return {
    ...FLOW_SERVER_SLICE_INITIAL_STATE_V2,
  };
};
