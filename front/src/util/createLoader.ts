import { Params, LoaderFunction } from "react-router-dom";
import { Observable, first, takeUntil, fromEvent } from "rxjs";

type CreateObservableFunction = {
  (params: Params<string>): Observable<Response | NonNullable<unknown> | null>;
};

export default function createLoader(
  create: CreateObservableFunction
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
