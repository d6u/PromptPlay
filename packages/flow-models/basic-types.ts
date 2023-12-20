// ANCHOR: V3 ID Types

// See https://stackoverflow.com/questions/41790393/typescript-strict-alias-checking
// to understand the reason for using `& { readonly "": unique symbol }`
export type NodeID = string & { readonly '': unique symbol };
export type EdgeID = string & { readonly '': unique symbol };
export type V3VariableID = string & { readonly '': unique symbol };
