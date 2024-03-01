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

export type SetState<T> = (
  updater: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined,
) => void;

export type GetState<T> = () => T;

export function withMiddlewares<State, Actions extends Record<string, unknown>>(
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

// ANCHOR: Flatten actions

function flattenStateToActions<Actions>(
  initialState: Actions,
  path: string[] = [],
  // TODO: Should this be Record<string, Function>?
  actions: Record<string, unknown> = {},
): FlattenObject<Actions> {
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

  return actions as FlattenObject<Actions>;
}

// ANCHOR: Create actor for state machines

export type WithActor<Context extends MachineContext, Event> = {
  start: () => void;
  stop: () => void;
  send: (event: Event) => void;
  getSnapshot: () => MachineSnapshot<
    Context,
    AnyEventObject,
    Record<string, AnyActorRef | undefined>,
    StateValue,
    string,
    unknown
  >;
};

export function withActor<
  Context extends MachineContext,
  Event extends AnyEventObject,
  Actions extends ParameterizedObject,
>(
  stateMachine: StateMachine<
    Context, // context
    Event, // event
    Record<string, AnyActorRef | undefined>, // children
    ProvidedActor, // actor
    Actions, // actions
    ParameterizedObject, // guards
    string, // delay
    StateValue, // state value
    string, // tag
    unknown, // input
    NonReducibleUnknown // output
  >,
): WithActor<Context, Event> {
  return stateMachine as unknown as WithActor<Context, Event>;
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
