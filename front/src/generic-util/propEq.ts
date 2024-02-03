import { D, F, flow } from '@mobily/ts-belt';

export default function propEq<T, K extends keyof T>(key: K, value: T[K]) {
  return flow(D.get<T, K>(key), F.equals(value));
}
