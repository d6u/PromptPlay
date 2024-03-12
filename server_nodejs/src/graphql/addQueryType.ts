import { SpaceEntity } from 'dynamodb-models/space';
import { UserEntity } from 'dynamodb-models/user';
import { BuilderType, Space, User } from './graphql-types';

export default function addQueryType(builder: BuilderType) {
  const QuerySpaceResult = builder
    .objectRef<QuerySpaceResultShape>('QuerySpaceResult')
    .implement({
      fields(t) {
        return {
          space: t.field({
            type: Space,
            resolve(parent, args, context) {
              return parent.space;
            },
          }),
          isReadOnly: t.exposeBoolean('isReadOnly'),
        };
      },
    });

  builder.queryType({
    fields(t) {
      return {
        hello: t.string({
          resolve(parent, args, context) {
            if (context.req.dbUser != null) {
              return `Hello ${
                context.req.dbUser.isPlaceholderUser
                  ? 'Guest Player 1'
                  : 'Player 1'
              }!`;
            }

            return `Hello World!`;
          },
        }),
        user: t.field({
          type: User,
          nullable: true,
          async resolve(parent, args, context) {
            if (!context.req.dbUser) {
              return null;
            }

            if (context.req.dbUser.isPlaceholderUser) {
              return new User(
                {
                  id: context.req.dbUser.id,
                  // TODO: Remove unused fields from User class.
                  createdAt: 0,
                  updatedAt: 0,
                },
                /* isPlaceholderUser */ true,
              );
            } else {
              // TODO: Load full dbUser on req so we don't have to load it
              // again.
              const { Item: dbUser } = await UserEntity.get({
                id: context.req.dbUser.id,
              });

              if (dbUser == null) {
                throw new Error('User should not be null');
              }

              return new User(dbUser, /* isPlaceholderUser */ false);
            }
          },
        }),
        space: t.field({
          type: QuerySpaceResult,
          nullable: true,
          args: {
            id: t.arg({ type: 'UUID', required: true }),
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
