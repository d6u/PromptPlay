import { BuilderType, ContentVersion, User } from "./graphql-types.js";

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
          resolve(parent, args, context) {
            return null;
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
          nullable: true,
          resolve(parent, args, context) {
            return null;
          },
        }),
        isReadOnly: t.boolean({
          resolve(parent, args, context) {
            return true;
          },
        }),
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
        id: t.string({
          resolve(parent, args, context) {
            return "";
          },
        }),
        name: t.string({
          resolve(parent, args, context) {
            return "";
          },
        }),
        contentVersion: t.field({
          type: ContentVersion,
          resolve(parent, args, context) {
            return ContentVersion.v3;
          },
        }),
        content: t.string({
          resolve(parent, args, context) {
            return "";
          },
        }),
        flowContent: t.string({
          resolve(parent, args, context) {
            return "";
          },
        }),
        contentV3: t.string({
          resolve(parent, args, context) {
            return "";
          },
        }),
        updatedAt: t.string({
          resolve(parent, args, context) {
            return "";
          },
        }),
      };
    },
  });

  builder.enumType(ContentVersion, {
    name: "ContentVersion",
  });
}
