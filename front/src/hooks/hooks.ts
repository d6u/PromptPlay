import { useRef } from "react";

export function useInitOnce<T>(initializer: () => T): T {
  const obj = useRef<T | null>(null);
  obj.current ??= initializer();
  return obj.current;
}
