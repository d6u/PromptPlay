import { RequestWithUser } from "../middleware/user.js";
import OrmSpace, { OrmContentVersion } from "../models/space.js";
import { UUID } from "../models/types.js";

type Context = {
  req: RequestWithUser;
};

export type User = {
  id: string;
  email: string | null;
  profilePictureUrl: string | null;
};

export class Space {
  private static fromOrmContentVersion(
    ormContentVersion: OrmContentVersion,
  ): ContentVersion {
    switch (ormContentVersion) {
      case OrmContentVersion.v1:
        return ContentVersion.v1;
      case OrmContentVersion.v2:
        return ContentVersion.v2;
      case OrmContentVersion.v3:
        return ContentVersion.v3;
    }
  }

  constructor(dbSpace: OrmSpace) {
    const obj = dbSpace.toJson();

    this.id = obj.id;
    this.name = obj.name;
    this.contentVersion = Space.fromOrmContentVersion(obj.contentVersion);
    this.content = obj.contentV2;
    this.flowContent = null;
    this.contentV3 = obj.contentV3;
    this.updatedAt = new Date().toISOString();
  }

  id: string;
  name: string;
  contentVersion: ContentVersion;
  content: string | null;
  flowContent: string | null;
  contentV3: string | null;
  updatedAt: string;
}

type QuerySpaceResult = {
  isReadOnly: boolean;
  space: Space | null;
};

type CreatePlaceholderUserAndExampleSpaceResult = {
  placeholderClientToken: UUID;
  space: Space;
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
    CreatePlaceholderUserAndExampleSpaceResult: CreatePlaceholderUserAndExampleSpaceResult;
  };
};

export type BuilderType = PothosSchemaTypes.SchemaBuilder<
  PothosSchemaTypes.ExtendDefaultTypes<Types>
>;
