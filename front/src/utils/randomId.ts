import { customAlphabet } from "nanoid";

// Generate a shorter more readable random ID for nodes and handles in
// reactflow.
// This is fine because we only need to guarantee uniqueness within the same
// flow.
const randomId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  5
);

export default randomId;
