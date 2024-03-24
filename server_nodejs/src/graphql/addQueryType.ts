import { prismaClient, UserType } from 'database-models';
import builder, { GraphQlQuerySpaceResult, GraphQlUser } from './schemaBuilder';

builder.queryType({
  fields(t) {
    return {
      hello: t.string({
        resolve(parent, args, context) {
          if (context.req.user == null) {
            return `Hello World!`;
          }

          return `Hello ${
            context.req.user.userType === UserType.PlaceholderUser
              ? 'Guest'
              : context.req.user.name
          }!`;
        },
      }),
      user: t.field({
        type: GraphQlUser,
        nullable: true,
        async resolve(parent, args, context) {
          if (!context.req.user) {
            return null;
          }

          return context.req.user;
        },
      }),
      space: t.field({
        type: GraphQlQuerySpaceResult,
        nullable: true,
        args: {
          id: t.arg({ type: 'UUID', required: true }),
        },
        async resolve(parent, args, context) {
          const flow = await prismaClient.flow.findUnique({
            where: { id: args.id },
          });

          if (flow == null) {
            return null;
          }

          return {
            space: flow,
            isReadOnly:
              context.req.user == null || context.req.user.id !== flow.userId,
          };
        },
      }),
    };
  },
});
