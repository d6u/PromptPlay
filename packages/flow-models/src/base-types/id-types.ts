// See https://stackoverflow.com/questions/41790393/typescript-strict-alias-checking
// to understand the reason for using `& { readonly "": unique symbol }`

export type NodeID = string & { readonly '': unique symbol };

export type EdgeID = string & { readonly '': unique symbol };

export type ConnectorID = string & { readonly '': unique symbol };
