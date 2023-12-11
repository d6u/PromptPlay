import { SpaceEntity } from "../models/space.js";
import { UsersTable } from "../models/user.js";
import { BuilderType, Space, User } from "./graphql-types.js";

export default function addQueryType(builder: BuilderType) {
  const QuerySpaceResult = builder
    .objectRef<QuerySpaceResultShape>("QuerySpaceResult")
    .implement({
      fields(t) {
        return {
          space: t.field({
            type: Space,
            resolve(parent, args, context) {
              return parent.space;
            },
          }),
          isReadOnly: t.exposeBoolean("isReadOnly"),
        };
      },
    });

  builder.queryType({
    fields(t) {
      return {
        hello: t.string({
          resolve(parent, args, context) {
            if (context.req.dbUser?.name) {
              return `Hello ${context.req.dbUser.name}!`;
            }

            return `Hello World!`;
          },
        }),
        isLoggedIn: t.boolean({
          description:
            "Check if there is a user and the user is not a placeholder user",
          resolve(parent, args, context) {
            return (
              context.req.dbUser != null &&
              !context.req.dbUser.isUserPlaceholder
            );
          },
        }),
        isPlaceholderUserTokenInvalid: t.boolean({
          description:
            "When PlaceholderUserToken header is present and the token is not mapped to a user",
          async resolve(parent, args, context) {
            const placeholderUserToken = context.req.header(
              "PlaceholderUserToken",
            );

            if (placeholderUserToken == null) {
              // NOTE: If the header is not present, it is not invalid,
              // i.e. it's valid.
              return false;
            }

            const response = await UsersTable.query(placeholderUserToken, {
              index: "PlaceholderClientTokenIndex",
            });

            return response.Items?.length === 0;
          },
        }),
        user: t.field({
          type: User,
          nullable: true,
          async resolve(parent, args, context) {
            return context.req.dbUser == null
              ? null
              : new User(context.req.dbUser);
          },
        }),
        space: t.field({
          type: QuerySpaceResult,
          nullable: true,
          args: {
            id: t.arg({ type: "UUID", required: true }),
          },
          async resolve(parent, args, context) {
            const { Item: dbSpace } = await SpaceEntity.get({ id: args.id });

            if (dbSpace == null) {
              return null;
            }

            return {
              space: new Space(dbSpace),
              isReadOnly:
                context.req.dbUser == null ||
                context.req.dbUser.id !== dbSpace.ownerId,
            };
          },
        }),
      };
    },
  });
}

type QuerySpaceResultShape = {
  isReadOnly: boolean;
  space: Space;
};
