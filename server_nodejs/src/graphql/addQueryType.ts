import { PlaceholderUserEntity } from 'dynamodb-models/placeholder-user.js';
import { SpaceEntity } from 'dynamodb-models/space.js';
import { UserEntity } from 'dynamodb-models/user.js';
import { BuilderType, Space, User } from './graphql-types.js';

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
        isLoggedIn: t.boolean({
          description:
            'Check if there is a user and the user is not a placeholder user',
          resolve(parent, args, context) {
            return (
              context.req.dbUser != null &&
              !context.req.dbUser.isPlaceholderUser
            );
          },
        }),
        isPlaceholderUserTokenInvalid: t.boolean({
          description:
            'When PlaceholderUserToken header is present and the token is not mapped to a user',
          async resolve(parent, args, context) {
            const placeholderUserToken = context.req.header(
              // NOTE: This header name is in lower case.
              'placeholderusertoken',
            );

            if (placeholderUserToken == null) {
              // NOTE: If the header is not present, it is not invalid,
              // i.e. it's valid.
              return false;
            }

            const { Item: dbPlaceholderUser } = await PlaceholderUserEntity.get(
              {
                placeholderClientToken: placeholderUserToken,
              },
            );

            return dbPlaceholderUser == null;
          },
        }),
        user: t.field({
          type: User,
          nullable: true,
          async resolve(parent, args, context) {
            if (context.req.dbUser == null) {
              return null;
            }

            if (context.req.dbUser.isPlaceholderUser) {
              return new User({
                id: context.req.dbUser.id,
                // TODO: Remove unused fields from User class.
                createdAt: 0,
                updatedAt: 0,
              });
            } else {
              const { Item: dbUser } = await UserEntity.get({
                id: context.req.dbUser.id,
              });

              if (dbUser == null) {
                throw new Error('User should not be null');
              }

              return new User(dbUser);
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
