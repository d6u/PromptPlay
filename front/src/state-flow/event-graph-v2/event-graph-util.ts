import { Draft } from 'immer';
import { SliceFlowContentV3State } from '../types';

type State = SliceFlowContentV3State;

type EventHandler<TIn, TOut> = (state: Draft<State>, event: TIn) => TOut[];

type EventProcessor<TIn> = (state: Draft<State>, event: TIn) => void;

type HandlerHolder<TIn, TOut> = {
  processEvent: EventProcessor<TIn>;
  register: (downstreamProcessor: EventProcessor<TOut>) => void;
};

export function createHandlerHolder<TIn, TOut>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: HandlerHolder<any, TIn>[],
  handleEvent: EventHandler<TIn, TOut>,
): HandlerHolder<TIn, TOut> {
  const DOWNSTREAM_PROCESSORS: EventProcessor<TOut>[] = [];

  function processEvent(state: State, event: TIn) {
    const nextEvents = handleEvent(state, event);
    for (const nextEvent of nextEvents) {
      for (const eventProcessor of DOWNSTREAM_PROCESSORS) {
        eventProcessor(state, nextEvent);
      }
    }
  }

  deps.forEach((dep) => {
    dep.register(processEvent);
  });

  return {
    processEvent,
    register(downstreamProcessor) {
      DOWNSTREAM_PROCESSORS.push(downstreamProcessor);
    },
  };
}
