export type UUID = string & { readonly "": unique symbol };

export function asUUID(id: string): UUID {
  return id as UUID;
}
