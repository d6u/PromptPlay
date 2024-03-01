import {
  AnyActorRef,
  AnyEventObject,
  MachineContext,
  NonReducibleUnknown,
  ParameterizedObject,
  ProvidedActor,
  StateMachine,
  StateValue,
} from 'xstate';

export type DefaultStateMachine = StateMachine<
  MachineContext, // context
  AnyEventObject, // event
  Record<string, AnyActorRef | undefined>, // children
  ProvidedActor, // actor
  ParameterizedObject, // actions
  ParameterizedObject, // guards
  string, // delay
  StateValue, // state value
  string, // tag
  unknown, // input
  NonReducibleUnknown // output
>;

// ANCHOR: TypeScript type util

/**
 * This will convert:
 *
 * { a: string; c: { d: string; }; };
 *
 * to:
 *
 * {'a': string; } | { 'c.d': string; }
 */
type FlattenObjectToKeyValueUnion<T, Prefix extends string = ''> = {
  [K in Extract<keyof T, string>]: T[K] extends Record<string, unknown>
    ? FlattenObjectToKeyValueUnion<
        T[K],
        `${Prefix}${K extends string ? `${K}.` : ''}`
      >
    : { [P in `${Prefix}${K}`]: T[K] };
}[Extract<keyof T, string>];

/**
 * This will convert:
 *
 * { a: string; } | { b: string; }
 *
 * to:
 *
 * { a: string; } & { b: string;
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

/**
 * This will combine above two, and convert:
 *
 * type ExampleType = { a: string; c: { d: string; }; };
 *
 * to:
 *
 * { a: string; } & { 'c.d': string; }
 */
export type FlattenObject<T> = UnionToIntersection<
  FlattenObjectToKeyValueUnion<T>
>;

/**
 * This will convert:
 *
 * 'a' | 'c.d'
 *
 * to:
 *
 * { type: 'a'; } | { type: 'c.d'; }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributeUnionAsParameterizedObject<U> = U extends any
  ? { type: U }
  : never;

/**
 * This will convert:
 *
 * { a: string; } & { 'c.d': string; }
 *
 * to:
 *
 * { type: 'a'; } | { type: 'c.d'; }
 */
type ExtractObjectKeyAsParameterizedObject<T> =
  DistributeUnionAsParameterizedObject<keyof T>;

/**
 * This will combine all above, and convert:
 *
 * { a: string; c: { d: string; }; };
 *
 * to:
 *
 * { type: 'a'; } | { type: 'c.d'; }
 */
export type StateObjectToParameterizedObject<T> =
  ExtractObjectKeyAsParameterizedObject<FlattenObject<T>>;
