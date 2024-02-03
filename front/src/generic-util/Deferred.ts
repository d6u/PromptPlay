export default class Deferred<T, E> {
  promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (reason?: E) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
