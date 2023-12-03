import "./orm-utils.js";
import { createOrmClass } from "./orm-utils.js";
import { UUID } from "./types.js";

type SpaceShape = {
  // Partition key
  id: UUID;

  // Sort key
  ownerId: UUID;

  name: string;
  contentVersion: OrmContentVersion;
  contentV2: string | null;
  contentV3: string | null;
};

export enum OrmContentVersion {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
}

const { createOrmInstance, findById } = createOrmClass<SpaceShape>({
  table: process.env.TABLE_NAME_SPACES,
  shape: {
    id: {
      type: "string",
      nullable: false,
      fieldName: "Id",
    },
    ownerId: {
      type: "string",
      nullable: false,
      fieldName: "OwnerId",
    },
    name: {
      type: "string",
      nullable: false,
      fieldName: "Name",
    },
    contentVersion: {
      type: "string",
      nullable: false,
      fieldName: "ContentVersion",
    },
    contentV2: {
      type: "string",
      nullable: true,
      fieldName: "ContentV2",
    },
    contentV3: {
      type: "string",
      nullable: true,
      fieldName: "ContentV3",
    },
  },
});

export const createOrmSpaceInstance = createOrmInstance;
export const findSpaceById = findById;
export type OrmSpace = ReturnType<typeof createOrmInstance>;
