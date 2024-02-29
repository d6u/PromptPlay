export type FlattenObjectKeys<
  T extends Record<string, unknown>,
  Key = keyof T,
> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : `${Key}`
  : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export type Distribute<U> = U extends any ? { type: U } : never;
