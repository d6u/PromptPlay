import { RequestWithUser } from "../middleware/user.js";
import { OrmCsvEvaluationPreset } from "../models/csv-evaluation-preset.js";
import { OrmContentVersion, OrmSpace } from "../models/space.js";
import { UUID } from "../models/types.js";
import { OrmUser } from "../models/user.js";

type Context = {
  req: RequestWithUser;
};

export type Types = {
  Context: Context;
  Objects: {
    CSVEvaluationPreset: CsvEvaluationPreset;
    QuerySpaceResult: QuerySpaceResult;
    CreatePlaceholderUserAndExampleSpaceResult: CreatePlaceholderUserAndExampleSpaceResult;
    CreateCsvEvaluationPresetResult: CreateCsvEvaluationPresetResult;
  };
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    UUID: {
      Input: string;
      Output: string;
    };
  };
};

export type BuilderType = PothosSchemaTypes.SchemaBuilder<
  PothosSchemaTypes.ExtendDefaultTypes<Types>
>;

// SECTION: User

export class User {
  constructor(public dbUser: OrmUser) {}
}

// !SECTION

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
    this.updatedAt = obj.updatedAt;
  }

  id: string;
  name: string;
  contentVersion: ContentVersion;
  content: string | null;
  flowContent: string | null;
  contentV3: string | null;
  updatedAt: Date;
}

export class CsvEvaluationPreset {
  constructor(dbCsvEvaluationPreset: OrmCsvEvaluationPreset) {
    const obj = dbCsvEvaluationPreset.toObject();

    this.id = obj.id;
    this.name = obj.name;
    this.csvContent = obj.csvContent;
    this.configContent = obj.configContent;
  }

  id: string;
  name: string;
  csvContent: string;
  configContent: string | null;
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

type CreateCsvEvaluationPresetResult = {
  space: Space;
  csvEvaluationPreset: CsvEvaluationPreset;
};

// !SECTION
