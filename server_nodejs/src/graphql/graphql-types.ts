import { RequestWithUser } from "../middleware/user.js";
import { CsvEvaluationPresetShape } from "../models/csv-evaluation-preset.js";
import { DbSpaceContentVersion, SpaceShape } from "../models/space.js";
import { UserShape } from "../models/user.js";

type Context = {
  req: RequestWithUser;
};

export type Types = {
  Context: Context;
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
  constructor(public dbUser: UserShape) {}
}

// !SECTION

// SECTION: Space

export class Space {
  constructor(dbSpace: SpaceShape) {
    this.id = dbSpace.id;
    this.name = dbSpace.name;
    this.contentVersion = parseDbSpaceContentVersion(dbSpace.contentVersion);
    this.contentV3 = dbSpace.contentV3;
    this.createdAt = new Date(dbSpace.createdAt);
    this.updatedAt = new Date(dbSpace.updatedAt);
  }

  id: string;
  name: string;
  contentVersion: SpaceContentVersion;
  contentV3: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum SpaceContentVersion {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
}

function parseDbSpaceContentVersion(value: string): SpaceContentVersion {
  switch (value) {
    case DbSpaceContentVersion.v3:
      return SpaceContentVersion.v3;
    default:
      throw new Error(`Invalid DbSpaceContentVersion: ${value}`);
  }
}

// !SECTION

// SECTION: CsvEvaluationPreset

export class CsvEvaluationPreset {}

export class CsvEvaluationPresetFull extends CsvEvaluationPreset {
  constructor(dbCsvEvaluationPreset: CsvEvaluationPresetShape) {
    super();

    this.id = dbCsvEvaluationPreset.id;
    this.ownerId = dbCsvEvaluationPreset.ownerId;
    this.spaceId = dbCsvEvaluationPreset.spaceId;
    this.name = dbCsvEvaluationPreset.name;
    this.csvString = dbCsvEvaluationPreset.csvString;
    this.configContentVersion = dbCsvEvaluationPreset.configContentVersion;
    this.configContentV1 = dbCsvEvaluationPreset.configContentV1;
    this.createdAt = new Date(dbCsvEvaluationPreset.createdAt);
    this.updatedAt = new Date(dbCsvEvaluationPreset.updatedAt);
  }

  id: string;
  ownerId: string;
  spaceId: string;
  name: string;
  csvString: string;
  configContentVersion: string;
  configContentV1: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CsvEvaluationPresetFromSpaceIdIndex extends CsvEvaluationPreset {
  constructor(
    dbCsvEvaluationPreset: Pick<
      CsvEvaluationPresetShape,
      "spaceId" | "id" | "name"
    >,
  ) {
    super();

    this.spaceId = dbCsvEvaluationPreset.spaceId;
    this.id = dbCsvEvaluationPreset.id;
    this.name = dbCsvEvaluationPreset.name;
  }

  id: string;
  name: string;
  spaceId: string;

  async getCsvContent(): Promise<string> {
    // TODO: Implement
    throw new Error("Not implemented");
  }

  async getConfigContent(): Promise<string> {
    // TODO: Implement
    throw new Error("Not implemented");
  }
}
