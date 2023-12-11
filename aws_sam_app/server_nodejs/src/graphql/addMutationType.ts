import { A, D, F } from "@mobily/ts-belt";
import { v4 as uuidv4 } from "uuid";
import {
  CsvEvaluationPresetEntity,
  DbCsvEvaluationPresetConfigContentVersion,
} from "../models/csv-evaluation-preset.js";
import { createSpaceWithExampleContent } from "../models/model-utils.js";
import {
  DbSpaceContentVersion,
  SpaceEntity,
  SpacesTable,
} from "../models/space.js";
import { UserEntity, UsersTable } from "../models/user.js";
import { nullThrow } from "../utils.js";
import {
  BuilderType,
  CsvEvaluationPreset,
  Space,
  SpaceContentVersion,
  User,
} from "./graphql-types.js";

export default function addMutationType(builder: BuilderType) {
  const CreatePlaceholderUserAndExampleSpaceResult = builder
    .objectRef<CreatePlaceholderUserAndExampleSpaceResultShape>(
      "CreatePlaceholderUserAndExampleSpaceResult",
    )
    .implement({
      fields(t) {
        return {
          placeholderClientToken: t.exposeID("placeholderClientToken"),
          space: t.field({
            type: Space,
            resolve(parent) {
              return parent.space;
            },
          }),
        };
      },
    });

  const CreateCsvEvaluationPresetResult = builder
    .objectRef<CreateCsvEvaluationPresetResultShape>(
      "CreateCsvEvaluationPresetResult",
    )
    .implement({
      fields(t) {
        return {
          space: t.field({
            type: Space,
            resolve(parent) {
              return parent.space;
            },
          }),
          csvEvaluationPreset: t.field({
            type: CsvEvaluationPreset,
            resolve(parent) {
              return parent.csvEvaluationPreset;
            },
          }),
        };
      },
    });

  builder.mutationType({
    fields(t) {
      return {
        createPlaceholderUserAndExampleSpace: t.field({
          type: CreatePlaceholderUserAndExampleSpaceResult,
          async resolve(parent, args, context) {
            let dbUser = context.req.dbUser;
            let placeholderClientToken: string;

            if (dbUser == null) {
              placeholderClientToken = uuidv4();

              const timestamp = new Date().toISOString();

              dbUser = {
                id: uuidv4(),
                isUserPlaceholder: true,
                placeholderClientToken,
                createdAt: timestamp,
                updatedAt: timestamp,
              };

              await UserEntity.put(dbUser);
            } else {
              placeholderClientToken = nullThrow(
                dbUser.placeholderClientToken,
                "placeholderClientToken should not be null",
              );
            }

            const dbSpace = createSpaceWithExampleContent(dbUser);

            await SpaceEntity.put(dbSpace);

            return {
              placeholderClientToken,
              space: new Space(dbSpace),
            };
          },
        }),
        mergePlaceholderUserWithLoggedInUser: t.field({
          type: User,
          nullable: true,
          args: {
            placeholderUserToken: t.arg({ type: "String", required: true }),
          },
          async resolve(parent, args, context) {
            // ANCHOR: Make sure there is a logged in user to merge to

            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            // ANCHOR: Make sure the provided placeholder user exists

            const queryPlaceholderUserResponse = await UsersTable.query(
              args.placeholderUserToken,
              { index: "PlaceholderClientTokenIndex", limit: 1 },
            );

            if (
              queryPlaceholderUserResponse.Items == null ||
              queryPlaceholderUserResponse.Items.length === 0
            ) {
              return null;
            }

            // ANCHOR: Merge the placeholder user's spaces to the logged in user

            const placeholderUserId =
              queryPlaceholderUserResponse.Items[0]!["Id"];

            const response = await SpaceEntity.query(placeholderUserId, {
              index: "OwnerIdIndex",
              // Parse works because OwnerIdIndex projects all the attributes.
              parseAsEntity: "Space",
            });

            const spaces = F.toMutable(
              A.map(response.Items ?? [], D.set("ownerId", dbUser.id)),
            );

            // ANCHOR: Delete the placeholder user

            const r = await SpacesTable.batchWrite(
              spaces
                // Using PutItem will replace the item with the same primary
                // key. This will update createdAt that should be immutable,
                // which is OK, because we are merging spaces into the new user.
                // It probably doesn't matter to throwaway createdAt value.
                .map((space) => SpaceEntity.putBatch(space))
                .concat([UserEntity.deleteBatch({ id: placeholderUserId })]),
            );

            // ANCHOR: Finish

            return new User(dbUser);
          },
        }),
        createSpace: t.field({
          type: Space,
          nullable: true,
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const timestamp = new Date().toISOString();

            const dbSpace = {
              id: uuidv4(),
              ownerId: dbUser.id,
              name: "Untitled",
              contentVersion: DbSpaceContentVersion.v3,
              contentV3: JSON.stringify({}),
              createdAt: timestamp,
              updatedAt: timestamp,
            };

            SpaceEntity.put(dbSpace);

            return new Space(dbSpace);
          },
        }),
        updateSpace: t.field({
          type: Space,
          args: {
            id: t.arg({ type: "ID", required: true }),
            name: t.arg({ type: "String" }),
            contentVersion: t.arg({ type: SpaceContentVersion }),
            content: t.arg({ type: "String" }),
            flowContent: t.arg({ type: "String" }),
            contentV3: t.arg({ type: "String" }),
          },
          nullable: true,
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            let { Item: dbSpace } = await SpaceEntity.get({
              id: args.id as string,
            });

            if (dbSpace == null) {
              return null;
            }

            if (args.name !== undefined) {
              if (args.name === null) {
                throw new Error("name cannot be null");
              } else {
                dbSpace.name = args.name;
              }
            }

            if (args.contentVersion !== undefined) {
              if (args.contentVersion === null) {
                throw new Error("contentVersion cannot be null");
              } else if (args.contentVersion === SpaceContentVersion.v3) {
                dbSpace.contentVersion = DbSpaceContentVersion.v3;
              } else {
                throw new Error(
                  `Invalid contentVersion: ${args.contentVersion}`,
                );
              }
            }

            if (args.contentV3 !== undefined) {
              dbSpace.contentV3 = nullThrow(args.contentV3);
            }

            SpaceEntity.update(dbSpace);

            return new Space(dbSpace);
          },
        }),
        deleteSpace: t.boolean({
          nullable: true,
          args: {
            id: t.arg({ type: "ID", required: true }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return false;
            }

            const { Item: dbSpace } = await SpaceEntity.get({ id: dbUser.id });

            if (dbSpace == null) {
              return false;
            }

            await SpaceEntity.delete({ id: dbSpace.id });

            return true;
          },
        }),
        createCsvEvaluationPreset: t.field({
          type: CreateCsvEvaluationPresetResult,
          nullable: true,
          args: {
            spaceId: t.arg({ type: "ID", required: true }),
            name: t.arg({ type: "String", required: true }),
            csvContent: t.arg({ type: "String" }),
            configContent: t.arg({ type: "String" }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const { Item: dbSpace } = await SpaceEntity.get({
              id: args.spaceId as string,
            });

            if (dbSpace == null) {
              return null;
            }

            const timestamp = new Date().toISOString();

            const dbPreset = {
              id: uuidv4(),
              ownerId: dbUser.id,
              spaceId: dbSpace.id,
              name: args.name,
              csvString: args.csvContent ?? "",
              configContentVersion:
                DbCsvEvaluationPresetConfigContentVersion.v1,
              configContentV1: args.configContent ?? "",
              createdAt: timestamp,
              updatedAt: timestamp,
            };

            await CsvEvaluationPresetEntity.put(dbPreset);

            return {
              space: new Space(dbSpace),
              csvEvaluationPreset: dbPreset,
            };
          },
        }),
        updateCsvEvaluationPreset: t.field({
          type: CsvEvaluationPreset,
          nullable: true,
          args: {
            presetId: t.arg({ type: "ID", required: true }),
            name: t.arg({ type: "String" }),
            csvContent: t.arg({ type: "String" }),
            configContent: t.arg({ type: "String" }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const { Item: dbPreset } = await CsvEvaluationPresetEntity.get({
              id: args.presetId as string,
            });

            if (dbPreset == null) {
              return null;
            }

            if (args.name !== undefined) {
              if (args.name === null) {
                throw new Error("name cannot be null");
              } else {
                dbPreset.name = args.name;
              }
            }

            if (args.csvContent !== undefined) {
              if (args.csvContent === null) {
                dbPreset.csvString = "";
              } else {
                dbPreset.csvString = args.csvContent;
              }
            }

            if (args.configContent !== undefined) {
              dbPreset.configContentV1 = nullThrow(args.configContent);
            }

            await CsvEvaluationPresetEntity.update(dbPreset);

            return dbPreset;
          },
        }),
        deleteCsvEvaluationPreset: t.field({
          type: Space,
          nullable: true,
          args: {
            id: t.arg({ type: "ID", required: true }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const { Item: dbPreset } = await CsvEvaluationPresetEntity.get({
              id: args.id as string,
            });

            if (dbPreset == null) {
              return null;
            }

            const spaceId = dbPreset.spaceId;

            await CsvEvaluationPresetEntity.delete({ id: dbPreset.id });

            const { Item: dbSpace } = await SpaceEntity.get({ id: spaceId });

            if (dbSpace == null) {
              return null;
            }

            return new Space(dbSpace);
          },
        }),
      };
    },
  });
}

type CreatePlaceholderUserAndExampleSpaceResultShape = {
  placeholderClientToken: string;
  space: Space;
};

type CreateCsvEvaluationPresetResultShape = {
  space: Space;
  csvEvaluationPreset: CsvEvaluationPreset;
};
