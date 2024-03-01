import { G } from '@mobily/ts-belt';
import {
  AnyActorRef,
  AnyEventObject,
  MachineContext,
  MachineSnapshot,
  NonReducibleUnknown,
  ParameterizedObject,
  ProvidedActor,
  StateMachine,
  StateValue,
  createActor,
} from 'xstate';
import { StateCreator, StoreApi } from 'zustand';

import { DefaultStateMachine, FlattenObject } from './state-machine-util';

export function withStateMachine<
  State,
  Actions extends Record<string, unknown>,
>(
  initializer: StateCreator<State & Actions, [], []>,
): StateCreator<State & Actions, [], []> {
  return (set, get, api) => {
    const initialState = initializer(set, get, api);

    const actions = flattenStateToActions<Actions>(initialState);

    const storeWithStateMachines = createActorForStateMachines(
      initialState,
      actions,
      api,
    );

    return storeWithStateMachines;
  };
}

function flattenStateToActions<State>(
  initialState: State,
  path: string[] = [],
  // TODO: Should this be Record<string, Function>?
  actions: Record<string, unknown> = {},
  // TODO: Improve FlattenObject by filtering functions in type
): FlattenObject<State> {
  for (const key in initialState) {
    const value = initialState[key];

    if (G.isFunction(value)) {
      actions[[...path, key].join('.')] = value;
    } else if (value instanceof StateMachine) {
      // Ignore StateMachine, because it's also an object
      continue;
    } else if (G.isObject(value)) {
      flattenStateToActions(value, [...path, key], actions);
    }
  }

  return actions as FlattenObject<State>;
}

export type ActorFor<
  Context extends MachineContext,
  Event extends AnyEventObject,
> = {
  start: () => void;
  stop: () => void;
  send: (event: Event) => void;
  getSnapshot: () => MachineSnapshot<
    Context, // context
    Event, // event
    Record<string, AnyActorRef | undefined>, // children
    StateValue, // state value
    string, // tag
    NonReducibleUnknown // output
  >;
};

export function actorFor<
  Context extends MachineContext,
  Event extends AnyEventObject,
>(
  stateMachine: StateMachine<
    Context, // context
    Event, // event
    Record<string, AnyActorRef | undefined>, // children
    ProvidedActor, // actor
    ParameterizedObject, // actions
    ParameterizedObject, // guards
    string, // delay
    StateValue, // state value
    string, // tag
    unknown, // input
    NonReducibleUnknown // output
  >,
): ActorFor<Context, Event> {
  return stateMachine as unknown as ActorFor<Context, Event>;
}

function createActorForStateMachines<State, FlattenActions>(
  _initialState: State,
  actions: FlattenActions,
  api: StoreApi<State>,
): State {
  const initialState = _initialState as Record<string, unknown>;

  const storeWithStateMachines: Record<string, unknown> = {};

  for (const key in initialState) {
    const _value = initialState[key];

    if (!(_value instanceof StateMachine)) {
      continue;
    }

    const value = _value as DefaultStateMachine;

    const actor = createActor(
      value.provide({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actions: actions as Record<string, any>,
      }),
      {
        inspect(event) {
          if (event.type === '@xstate.event') {
            console.log(`[${key}] event:`, event.event);
          }
        },
      },
    );

    let subscription: ReturnType<typeof actor.subscribe> | null = null;

    storeWithStateMachines[key] = {
      start: () => {
        subscription = actor.subscribe((snapshot) => {
          console.log(
            '[State Machine] state:',
            JSON.stringify(snapshot.value, null, 2),
          );

          api.setState({});
        });

        actor.start();
        console.log(`after start`);
      },
      stop: () => {
        subscription?.unsubscribe();
        actor.stop();
      },
      send: (event: AnyEventObject) => actor.send(event),
      getSnapshot: () => actor.getSnapshot(),
    };
  }

  return { ...initialState, ...storeWithStateMachines } as State;
}
