import SchemaBuilder from "@pothos/core";
import { Express } from "express";
import { createYoga } from "graphql-yoga";
import { attachUser, RequestWithUser } from "./middleware/user.js";
import OrmUser from "./models/users.js";

type Context = {
  req: RequestWithUser;
};

type User = {
  id: string;
  email: string | null;
  profilePictureUrl: string | null;
};

type Space = {
  id: string | null;
  name: string | null;
  description: string | null;
};

type QuerySpaceResult = {
  isReadOnly: boolean;
  space: Space | null;
};

type Types = {
  Context: Context;
  Objects: {
    User: User;
    Space: Space;
    QuerySpaceResult: QuerySpaceResult;
  };
};

enum ContentVersion {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
}

const builder = new SchemaBuilder<Types>({});

builder.queryType({
  fields(t) {
    return {
      hello: t.string({
        resolve(parent, args, context) {
          if (context.req.user?.name) {
            return `Hello ${context.req.user.name}!`;
          }

          return `Hello World!`;
        },
      }),
      isLoggedIn: t.boolean({
        description:
          "Check if there is a user and the user is not a placeholder user",
        resolve(parent, args, context) {
          // TODO: Check if user is a placeholder user
          return context.req.user != null;
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
          const userId = context.req.user?.userId;
          return userId == null ? null : await OrmUser.findById(userId);
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

const yoga = createYoga({
  schema: builder.toSchema(),
});

export default function setupGraphql(app: Express) {
  app.use(yoga.graphqlEndpoint, attachUser, yoga);
}
