import { findSpaceById } from "../models/space.js";
import { BuilderType, ContentVersion, Space, User } from "./graphql-types.js";

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
            // TODO: Check if user is a placeholder user
            return context.req.dbUser != null;
          },
        }),
        isPlaceholderUserTokenInvalid: t.boolean({
          description: "Check if the placeholder user token is invalid",
          resolve(parent, args, context) {
            // TODO: Check if user is a placeholder user
            return true;
          },
        }),
        user: t.field({
          type: "User",
          nullable: true,
          async resolve(parent, args, context) {
            // NOTE: Force cast to User because user fetched from DB shouldn't
            // have null id field.
            return context.req.dbUser as User;
          },
        }),
        space: t.field({
          type: "QuerySpaceResult",
          nullable: true,
          args: {
            id: t.arg.string({ required: true }),
          },
          async resolve(parent, args, context) {
            const dbSpace = await findSpaceById(args.id);
            if (dbSpace == null) {
              return null;
            }
            return {
              space: new Space(dbSpace),
              isReadOnly: true,
            };
          },
        }),
      };
    },
  });

  builder.objectType("QuerySpaceResult", {
    fields(t) {
      return {
        space: t.field({
          type: "Space",
          resolve(parent, args, context) {
            return parent.space;
          },
        }),
        isReadOnly: t.exposeBoolean("isReadOnly"),
      };
    },
  });

  builder.objectType("User", {
    fields(t) {
      return {
        id: t.exposeString("id"),
        email: t.exposeString("email", { nullable: true }),
        profilePictureUrl: t.exposeString("profilePictureUrl", {
          nullable: true,
        }),
        spaces: t.field({
          type: ["Space"],
          resolve(parent, args, context) {
            return [];
          },
        }),
      };
    },
  });

  builder.objectType("Space", {
    fields(t) {
      return {
        id: t.exposeString("id"),
        name: t.exposeString("name"),
        contentVersion: t.field({
          type: ContentVersion,
          resolve(parent, args, context) {
            return parent.contentVersion;
          },
        }),
        content: t.exposeString("content", { nullable: true }),
        flowContent: t.exposeString("flowContent", { nullable: true }),
        contentV3: t.exposeString("contentV3", { nullable: true }),
        updatedAt: t.field({
          type: "Date",
          resolve(parent, args, context) {
            return parent.updatedAt;
          },
        }),
      };
    },
  });

  builder.enumType(ContentVersion, {
    name: "ContentVersion",
  });
}
