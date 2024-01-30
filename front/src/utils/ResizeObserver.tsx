import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

type OnResizeCallback = (contentRect: DOMRectReadOnly) => void;

const ResizeObserverContext = createContext<{
  observe: (target: Element, callback: OnResizeCallback) => void;
  unobserve: (target: Element) => void;
}>({
  observe: () => {},
  unobserve: () => {},
});

export function ResizeObserverProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const elementCallbackMapRef = useRef<Map<Element, OnResizeCallback>>(
    new Map(),
  );

  const resizeObserverRef = useRef<ResizeObserver>();

  if (resizeObserverRef.current == null) {
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const callback = elementCallbackMapRef.current.get(entry.target);
        if (callback != null) {
          callback(entry.contentRect);
        }
      }
    });
  }

  const observe = useCallback((target: Element, callback: OnResizeCallback) => {
    if (elementCallbackMapRef.current.has(target)) {
      elementCallbackMapRef.current.set(target, callback);
    } else {
      elementCallbackMapRef.current.set(target, callback);
      resizeObserverRef.current!.observe(target);
    }
  }, []);

  const unobserve = useCallback((target: Element) => {
    elementCallbackMapRef.current.delete(target);
    resizeObserverRef.current!.unobserve(target);
  }, []);

  useEffect(() => {
    return () => {
      resizeObserverRef.current!.disconnect();
    };
  }, []);

  return (
    <ResizeObserverContext.Provider value={{ observe, unobserve }}>
      {children}
    </ResizeObserverContext.Provider>
  );
}

export function useOnElementResize(
  ref: React.RefObject<HTMLElement>,
  callback: OnResizeCallback,
) {
  const { observe, unobserve } = useContext(ResizeObserverContext);

  const el = ref.current;

  useEffect(() => {
    if (el == null) {
      return;
    }

    observe(el, callback);

    return () => {
      unobserve(el);
    };
  }, [el, callback, observe, unobserve]);
}
