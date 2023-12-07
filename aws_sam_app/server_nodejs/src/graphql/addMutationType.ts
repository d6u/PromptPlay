import { v4 as uuidv4 } from "uuid";
import {
  createOrmSpaceInstance,
  deleteSpaceById,
  findSpaceById,
  OrmContentVersion,
  querySpacesByOwnerId,
} from "../models/space.js";
import { asUUID, UUID } from "../models/types.js";
import {
  createOrmUserInstance,
  deleteUserById,
  getUserIdByPlaceholderUserToken,
} from "../models/user.js";
import { createSpaceWithExampleContent } from "../models/utils.js";
import { nullThrow } from "../utils.js";
import { BuilderType, ContentVersion, Space } from "./graphql-types.js";

export default function addMutationType(builder: BuilderType) {
  builder.mutationType({
    fields(t) {
      return {
        createPlaceholderUserAndExampleSpace: t.field({
          type: "CreatePlaceholderUserAndExampleSpaceResult",
          async resolve(parent, args, context) {
            let dbUser = context.req.dbUser;
            let placeholderClientToken: UUID;

            if (dbUser == null) {
              placeholderClientToken = asUUID(uuidv4());

              dbUser = createOrmUserInstance({
                isUserPlaceholder: true,
                name: null,
                email: null,
                profilePictureUrl: null,
                auth0UserId: null,
                placeholderClientToken: placeholderClientToken,
              });

              await dbUser.save();
            } else {
              placeholderClientToken = nullThrow(
                dbUser.placeholderClientToken,
                "placeholderClientToken should not be null",
              );
            }

            const dbSpace = createSpaceWithExampleContent(dbUser);

            await dbSpace.save();

            return {
              placeholderClientToken,
              space: new Space(dbSpace),
            };
          },
        }),

        mergePlaceholderUserWithLoggedInUser: t.field({
          type: "User",
          args: {
            placeholderUserToken: t.arg({
              type: "String",
              required: true,
            }),
          },
          nullable: true,
          async resolve(parent, args, context) {
            // ANCHOR: Make sure there is a logged in user to merge to
            const dbUser = context.req.dbUser;
            if (dbUser == null) {
              return null;
            }

            // ANCHOR: Make sure the provided placeholder user exists
            const placeholderUserId = await getUserIdByPlaceholderUserToken(
              asUUID(args.placeholderUserToken),
            );
            if (placeholderUserId == null) {
              return null;
            }

            // ANCHOR: Merge the placeholder user's spaces to the logged in user
            const spaces = await querySpacesByOwnerId(placeholderUserId);
            await Promise.all(
              spaces.map((space) => {
                space.ownerId = dbUser.id;
                return space.save();
              }),
            );

            // ANCHOR: Delete the placeholder user
            await deleteUserById(placeholderUserId);

            // ANCHOR: Finish
            return dbUser;
          },
        }),
        createSpace: t.field({
          type: "Space",
          nullable: true,
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const dbSpace = createOrmSpaceInstance({
              ownerId: dbUser.id,
              name: "Untitled",
              contentVersion: OrmContentVersion.v3,
              contentV2: null,
              contentV3: JSON.stringify({}),
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            await dbSpace.save();

            return new Space(dbSpace);
          },
        }),
        updateSpace: t.field({
          type: "Space",
          args: {
            id: t.arg({ type: "String", required: true }),
            name: t.arg({ type: "String" }),
            contentVersion: t.arg({ type: ContentVersion }),
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

            const dbSpace = await findSpaceById(dbUser.id);

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
              } else if (args.contentVersion === ContentVersion.v1) {
                throw new Error("contentVersion cannot be v1");
              } else if (args.contentVersion === ContentVersion.v2) {
                throw new Error("contentVersion cannot be v2");
              } else {
                dbSpace.contentVersion = OrmContentVersion.v3;
              }
            }

            if (args.content !== undefined) {
              dbSpace.contentV2 = args.content;
            }

            if (args.flowContent !== undefined) {
              dbSpace.contentV2 = args.flowContent;
            }

            if (args.contentV3 !== undefined) {
              dbSpace.contentV3 = args.contentV3;
            }

            await dbSpace.save();

            return new Space(dbSpace);
          },
        }),
        deleteSpace: t.boolean({
          args: {
            id: t.arg({ type: "String", required: true }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return false;
            }

            const dbSpace = await findSpaceById(dbUser.id);

            if (dbSpace == null) {
              return false;
            }

            await deleteSpaceById(dbSpace.id);

            return true;
          },
        }),
        // TODO: Create CSV evaluation preset
        // TODO: Update CSV evaluation preset
        // TODO: Delete CSV evaluation preset
      };
    },
  });

  builder.objectType("CreatePlaceholderUserAndExampleSpaceResult", {
    fields(t) {
      return {
        placeholderClientToken: t.exposeString("placeholderClientToken"),
        space: t.field({
          type: "Space",
          resolve(parent) {
            return parent.space;
          },
        }),
      };
    },
  });
}
