import { findSpaceById } from "../models/space.js";
import { asUUID } from "../models/types.js";
import { getUserIdByPlaceholderUserToken } from "../models/user.js";
import { BuilderType, Space, User } from "./graphql-types.js";

export default function addQueryType(builder: BuilderType) {
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
          description: "Check if the placeholder user token is invalid",
          async resolve(parent, args, context) {
            const placeholderUserToken = context.req.header(
              "PlaceholderUserToken",
            );

            if (placeholderUserToken == null) {
              // NOTE: If the header is not present, it is not invalid,
              // i.e. it's valid.
              return false;
            }

            const userId = await getUserIdByPlaceholderUserToken(
              asUUID(placeholderUserToken),
            );

            return userId == null;
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
          type: "QuerySpaceResult",
          nullable: true,
          args: {
            id: t.arg({ type: "UUID", required: true }),
          },
          async resolve(parent, args, context) {
            const dbSpace = await findSpaceById(args.id);
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
