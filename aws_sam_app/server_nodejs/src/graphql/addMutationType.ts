import { v4 as uuidv4 } from "uuid";
import { querySpacesByOwnerId } from "../models/space.js";
import { asUUID, UUID } from "../models/types.js";
import {
  createOrmUserInstance,
  deleteUserById,
  getUserIdByPlaceholderUserToken,
} from "../models/user.js";
import { createSpaceWithExampleContent } from "../models/utils.js";
import { nullThrow } from "../utils.js";
import { BuilderType, Space } from "./graphql-types.js";

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
