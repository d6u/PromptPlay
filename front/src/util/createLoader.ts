import { Params, LoaderFunction } from "react-router-dom";
import { Observable, first, takeUntil, fromEvent } from "rxjs";

export type CreateObservableFunction<T> = {
  (params: Params<string>): Observable<Response | NonNullable<T> | null>;
};

export default function createLoader<T>(
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
