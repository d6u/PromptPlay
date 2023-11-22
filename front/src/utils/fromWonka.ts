import { Observable } from "rxjs";
import { OperationResult, OperationResultSource } from "urql";
import { toObservable, pipe } from "wonka";

export default function fromWonka<T>(
  source: OperationResultSource<OperationResult<T>>
): Observable<OperationResult<T>> {
  return new Observable((observer) => {
    const subscription = pipe(source, toObservable).subscribe(observer);
    return () => subscription.unsubscribe();
  });
}
