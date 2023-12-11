export function nullThrow<T>(
  val: T | undefined | null,
  msg: string | null = null,
): T {
  if (val != null) {
    return val;
  }

  if (msg != null) {
    throw new Error(msg);
  } else {
    throw new Error("Unexpected null");
  }
}
