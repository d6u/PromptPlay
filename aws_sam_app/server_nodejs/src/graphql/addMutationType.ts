import { v4 as uuidv4 } from "uuid";
import { asUUID, UUID } from "../models/types.js";
import {
  createOrmUserInstance,
  findUserByPlaceholderUserToken,
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
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const dbPlaceholderUser = await findUserByPlaceholderUserToken(
              asUUID(args.placeholderUserToken),
            );

            if (dbPlaceholderUser == null) {
              return null;
            }

            // Select spaces of placeholder user

            // Assign spaces to dbUser

            // Delete placeholder user

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
