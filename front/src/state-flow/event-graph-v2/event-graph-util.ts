import { Draft } from 'immer';

import { G } from '@mobily/ts-belt';
import invariant from 'tiny-invariant';
import { SliceFlowContentV3State } from '../types';

type State = SliceFlowContentV3State;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseEvent = { type: any };

type EventSelector<TIn extends BaseEvent> = (event: BaseEvent) => event is TIn;

type HandleEventFun<TIn, TOut> = (state: Draft<State>, event: TIn) => TOut[];

type Handler<TIn> = (state: Draft<State>, event: TIn) => void;

function createHandler<TIn, TOut>(
  handleEvent: HandleEventFun<TIn, TOut>,
): Handler<TIn>;
function createHandler<TIn, TOut>(
  handleEvent: HandleEventFun<TIn, TOut>,
  nextHandlers: Handler<TOut>[],
): Handler<TIn>;
function createHandler<TSelect extends BaseEvent, TOut>(
  selector: EventSelector<TSelect>,
  handleEvent: HandleEventFun<TSelect, TOut>,
): Handler<BaseEvent>;
function createHandler<TSelect extends BaseEvent, TOut>(
  selector: EventSelector<TSelect>,
  handleEvent: HandleEventFun<TSelect, TOut>,
  nextHandlers: Handler<TOut>[],
): Handler<BaseEvent>;
function createHandler<TIn, TSelect extends BaseEvent, TOut>(
  handleEventOrSelector: HandleEventFun<TIn, TOut> | EventSelector<TSelect>,
  nextHandlersOrHandleEvent?: Handler<TOut>[] | HandleEventFun<TSelect, TOut>,
  emptyOrNextHandlers?: Handler<TOut>[],
): Handler<TIn> | Handler<BaseEvent> {
  let selector: EventSelector<TSelect> | null;
  let handleEvent: HandleEventFun<TIn, TOut> | HandleEventFun<TSelect, TOut>;
  let nextHandlers: Handler<TOut>[];

  if (emptyOrNextHandlers != null) {
    selector = handleEventOrSelector as EventSelector<TSelect>;
    handleEvent = nextHandlersOrHandleEvent as HandleEventFun<TSelect, TOut>;
    nextHandlers = emptyOrNextHandlers;
  } else {
    if (nextHandlersOrHandleEvent == null) {
      selector = null;
      handleEvent = handleEventOrSelector as HandleEventFun<TIn, TOut>;
      nextHandlers = [];
    } else {
      if (G.isArray(nextHandlersOrHandleEvent)) {
        selector = null;
        handleEvent = handleEventOrSelector as HandleEventFun<TIn, TOut>;
        nextHandlers = nextHandlersOrHandleEvent;
      } else {
        selector = handleEventOrSelector as EventSelector<TSelect>;
        handleEvent = nextHandlersOrHandleEvent;
        nextHandlers = [];
      }
    }
  }

  // NOTE: Below is a bit verbose. But it's for working with TypeScript.

  if (selector == null) {
    return function handleEventWrapper(state: State, event: TIn) {
      const nextEvents = (handleEvent as HandleEventFun<TIn, TOut>)(
        state,
        event,
      );

      for (const nextEvent of nextEvents) {
        for (const handler of nextHandlers) {
          handler(state, nextEvent);
        }
      }
    };
  } else {
    return function handleEventWrapper(state: State, event: BaseEvent) {
      invariant(selector != null, 'selector is not null');

      if (!selector(event)) {
        return;
      }

      const nextEvents = (handleEvent as HandleEventFun<TSelect, TOut>)(
        state,
        event,
      );

      for (const nextEvent of nextEvents) {
        for (const handler of nextHandlers) {
          handler(state, nextEvent);
        }
      }
    };
  }
}

export { createHandler };
