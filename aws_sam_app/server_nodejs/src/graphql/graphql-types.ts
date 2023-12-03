import { RequestWithUser } from "../middleware/user.js";
import { OrmContentVersion, OrmSpace } from "../models/space.js";
import { UUID } from "../models/types.js";

export type Types = {
  Context: Context;
  Objects: {
    User: User;
    Space: Space;
    QuerySpaceResult: QuerySpaceResult;
    CreatePlaceholderUserAndExampleSpaceResult: CreatePlaceholderUserAndExampleSpaceResult;
  };
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
};

export type BuilderType = PothosSchemaTypes.SchemaBuilder<
  PothosSchemaTypes.ExtendDefaultTypes<Types>
>;

type Context = {
  req: RequestWithUser;
};

// SECTION: Objects

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
    const obj = dbSpace.toObject();

    this.id = obj.id;
    this.name = obj.name;
    this.contentVersion = Space.fromOrmContentVersion(obj.contentVersion);
    this.content = obj.contentV2;
    this.flowContent = null;
    this.contentV3 = obj.contentV3;
    this.updatedAt = new Date();
  }

  id: string;
  name: string;
  contentVersion: ContentVersion;
  content: string | null;
  flowContent: string | null;
  contentV3: string | null;
  updatedAt: Date;
}

export class QuerySpaceResult {
  constructor({ isReadOnly, space }: { isReadOnly: boolean; space: Space }) {
    this.isReadOnly = isReadOnly;
    this.space = space;
  }

  isReadOnly: boolean;
  space: Space;
}

type CreatePlaceholderUserAndExampleSpaceResult = {
  placeholderClientToken: UUID;
  space: Space;
};

export enum ContentVersion {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
}

// !SECTION
