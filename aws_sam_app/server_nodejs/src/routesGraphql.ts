import SchemaBuilder from "@pothos/core";
import { Express } from "express";
import { createYoga } from "graphql-yoga";
import { attachUser, RequestWithUser } from "./middleware/user.js";

type Context = {
  req: RequestWithUser;
};

type User = {
  id: string | null;
  name: string | null;
  profilePictureUrl: string | null;
};

type Workspace = {
  id: string | null;
  name: string | null;
  updatedAt: string | null;
};

type Preset = {
  id: string | null;
  name: string | null;
  updatedAt: string | null;
};

type Types = {
  Context: Context;
  Objects: {
    User: User;
    Workspace: Workspace;
    Preset: Preset;
  };
};

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
        resolve(parent, args, context) {
          return { name: "temp" };
        },
      }),
      workspace: t.field({
        type: "Workspace",
        resolve(parent, args, context) {
          return { name: "temp" };
        },
      }),
      presets: t.field({
        type: "Presets",
        resolve(parent, args, context) {
          return { name: "temp" };
        },
      }),
      space: t.field({
        type: "Space",
        resolve(parent, args, context) {
          return { name: "temp" };
        },
      }),
    };
  },
});

builder.objectType("User", {
  fields(t) {
    return {
      name: t.string({
        resolve(parent, args, context) {
          return context.req.user?.name ?? "World";
        },
      }),
      email: t.string({
        resolve(parent, args, context) {
          return context.req.user?.email ?? "World";
        },
      }),
      profilePictureUrl: t.string({
        resolve(parent, args, context) {
          return context.req.user?.profilePictureUrl ?? "World";
        },
      }),
    };
  },
});

builder.objectType("Workspace", {
  fields(t) {
    return {
      name: t.string({
        resolve(parent, args, context) {
          return context.req.user?.name ?? "World";
        },
      }),
      id: t.string({
        resolve(parent, args, context) {
          return context.req.user?.email ?? "World";
        },
      }),
      description: t.string({
        resolve(parent, args, context) {
          return context.req.user?.profilePictureUrl ?? "World";
        },
      }),
    };
  },
});

const yoga = createYoga({
  schema: builder.toSchema(),
});

export default function setupGraphql(app: Express) {
  app.use(yoga.graphqlEndpoint, attachUser, yoga);
}
