import { Observable, first } from 'rxjs';
import { OperationResult, OperationResultSource } from 'urql';
import { pipe, toObservable } from 'wonka';

export function fromWonka<T>(
  source: OperationResultSource<OperationResult<T>>,
): Observable<OperationResult<T>> {
  return new Observable((observer) => {
    const subscription = pipe(source, toObservable).subscribe(observer);
    return () => subscription.unsubscribe();
  });
}

export function toRxObservableSingle<T>(
  source: OperationResultSource<OperationResult<T>>,
): Observable<OperationResult<T>> {
  return fromWonka(source).pipe(first());
}
