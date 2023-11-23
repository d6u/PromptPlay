import { LoaderFunction, Params } from "react-router-dom";
import { first, takeUntil, fromEvent, Observable } from "rxjs";

export type CreateObservableFunction<T> = {
  (params: Params<string>): Observable<Response | NonNullable<T> | null>;
};

export function createLoader<T>(
  create: CreateObservableFunction<T>
): LoaderFunction {
  return ({ request, params }) =>
    new Promise((resolve, reject) => {
      create(params)
        .pipe(first(), takeUntil(fromEvent(request.signal, "abort")))
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
}
