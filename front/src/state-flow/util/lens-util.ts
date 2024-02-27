import { PropType } from '@dhmk/utils';
import { Getter, Setter } from '@dhmk/zustand-lens';
import { Draft, Patch, produce, produceWithPatches } from 'immer';

type Recipe<T> = (draft: Draft<T>) => Draft<T> | void;

type CreateWithImmerReturn<T> = {
  set: (
    recipe: Recipe<T>,
    replace?: boolean | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => void;
  setWithPatches: (
    recipe: Recipe<T>,
    replace?: boolean | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => [boolean, Patch[], Patch[]];
  get: () => T;
};

export function createWithImmer<T, P extends string[], State = PropType<T, P>>(
  param: [Setter<State>, Getter<State>],
): CreateWithImmerReturn<State> {
  const [setLens, getLens] = param;

  function set(
    recipe: Recipe<State>,
    replace?: boolean | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): void {
    setLens(
      (state) => {
        return produce(state, (draft) => recipe(draft));
      },
      replace,
      ...args,
    );
  }

  function setWithPatches(
    recipe: Recipe<State>,
    replace?: boolean | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): [boolean, Patch[], Patch[]] {
    let isDirty: boolean;
    let patches: Patch[];
    let inversePatches: Patch[];

    setLens(
      (state) => {
        const [nextState, patchesInner, inversePatchesInner] =
          produceWithPatches(state, (draft) => recipe(draft));

        isDirty = nextState !== state;
        patches = patchesInner;
        inversePatches = inversePatchesInner;

        return nextState;
      },
      replace,
      ...args,
    );

    return [isDirty!, patches!, inversePatches!];
  }

  return {
    set,
    setWithPatches,
    get: getLens,
  };
}
