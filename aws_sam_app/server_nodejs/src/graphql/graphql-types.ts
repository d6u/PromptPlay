import { RequestWithUser } from "../middleware/user.js";

type Context = {
  req: RequestWithUser;
};

export type User = {
  id: string;
  email: string | null;
  profilePictureUrl: string | null;
};

type Space = {
  id: string | null;
  name: string | null;
  description: string | null;
};

type QuerySpaceResult = {
  isReadOnly: boolean;
  space: Space | null;
};

export enum ContentVersion {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
}

export type Types = {
  Context: Context;
  Objects: {
    User: User;
    Space: Space;
    QuerySpaceResult: QuerySpaceResult;
  };
};

export type BuilderType = PothosSchemaTypes.SchemaBuilder<
  PothosSchemaTypes.ExtendDefaultTypes<Types>
>;
