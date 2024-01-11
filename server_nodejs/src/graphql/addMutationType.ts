import {
  CsvEvaluationPresetEntity,
  CsvEvaluationPresetShape,
  DbCsvEvaluationPresetConfigContentVersion,
} from 'dynamodb-models/csv-evaluation-preset.js';
import { createSpaceWithExampleContent } from 'dynamodb-models/model-utils.js';
import { PlaceholderUserEntity } from 'dynamodb-models/placeholder-user.js';
import {
  DbSpaceContentVersion,
  SpaceEntity,
  SpaceShape,
} from 'dynamodb-models/space.js';
import { nullThrow } from '../utils/utils.js';
import {
  BuilderType,
  CsvEvaluationPreset,
  CsvEvaluationPresetFromSpaceIdIndex,
  CsvEvaluationPresetFull,
  Space,
  SpaceContentVersion,
} from './graphql-types.js';

export default function addMutationType(builder: BuilderType) {
  const CreatePlaceholderUserAndExampleSpaceResult = builder
    .objectRef<CreatePlaceholderUserAndExampleSpaceResultShape>(
      'CreatePlaceholderUserAndExampleSpaceResult',
    )
    .implement({
      fields(t) {
        return {
          placeholderClientToken: t.exposeID('placeholderClientToken', {
            nullable: true,
            deprecationReason:
              'placeholderUserToken have been moved to session storage',
          }),
          space: t.field({
            type: Space,
            resolve(parent) {
              return parent.space;
            },
          }),
        };
      },
    });

  const CreateCsvEvaluationPresetResult = builder
    .objectRef<CreateCsvEvaluationPresetResultShape>(
      'CreateCsvEvaluationPresetResult',
    )
    .implement({
      fields(t) {
        return {
          space: t.field({
            type: Space,
            resolve(parent) {
              return parent.space;
            },
          }),
          csvEvaluationPreset: t.field({
            type: CsvEvaluationPreset,
            resolve(parent) {
              if (
                parent.csvEvaluationPreset instanceof
                  CsvEvaluationPresetFromSpaceIdIndex ||
                parent.csvEvaluationPreset instanceof CsvEvaluationPresetFull
              ) {
                return parent.csvEvaluationPreset;
              } else {
                throw new Error(
                  `Invalid parent.csvEvaluationPreset: ${parent.csvEvaluationPreset}`,
                );
              }
            },
          }),
        };
      },
    });

  builder.mutationType({
    fields(t) {
      return {
        createPlaceholderUserAndExampleSpace: t.field({
          type: CreatePlaceholderUserAndExampleSpaceResult,
          async resolve(parent, args, context) {
            let dbUser = context.req.dbUser;
            let placeholderClientToken: string;

            if (dbUser == null) {
              // NOTE: Because put doesn't return the default value,
              // e.g. createdAt, use this as a workaround.
              const dbPlaceholderUser = PlaceholderUserEntity.parse(
                PlaceholderUserEntity.putParams({}).Item!,
              );

              await PlaceholderUserEntity.put(dbPlaceholderUser);

              placeholderClientToken = dbPlaceholderUser.placeholderClientToken;

              // NOTE: The key on session is different from the key in DB
              context.req.session!.placeholderUserToken =
                placeholderClientToken;
            } else if (dbUser.isPlaceholderUser) {
              placeholderClientToken = dbUser.id;
            } else {
              throw new Error('Current user should be a placeholder user');
            }

            const rawDbSpace = createSpaceWithExampleContent(
              placeholderClientToken!,
            );

            // NOTE: Because put doesn't return the default value,
            // e.g. createdAt, use this as a workaround.
            const dbSpace = SpaceEntity.parse(
              SpaceEntity.putParams(rawDbSpace).Item!,
            );

            await SpaceEntity.put(dbSpace);

            return {
              // TODO: Remove this field
              placeholderClientToken: null,
              space: new Space(dbSpace),
            };
          },
        }),
        createSpace: t.field({
          type: Space,
          nullable: true,
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            // NOTE: Because put doesn't return the default value,
            // e.g. createdAt, use this as a workaround.
            const dbSpace = SpaceEntity.parse(
              SpaceEntity.putParams({
                ownerId: dbUser.id,
                name: 'Untitled',
                contentVersion: DbSpaceContentVersion.v3,
                contentV3: JSON.stringify({}),
              }).Item!,
            );

            await SpaceEntity.put(dbSpace);

            return new Space(dbSpace);
          },
        }),
        updateSpace: t.field({
          type: Space,
          args: {
            id: t.arg({ type: 'ID', required: true }),
            name: t.arg({ type: 'String' }),
            contentVersion: t.arg({ type: SpaceContentVersion }),
            content: t.arg({ type: 'String' }),
            flowContent: t.arg({ type: 'String' }),
            contentV3: t.arg({ type: 'String' }),
          },
          nullable: true,
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            let { Item: oldDbSpace } = await SpaceEntity.get({
              id: args.id as string,
            });

            if (oldDbSpace == null) {
              return null;
            }

            if (oldDbSpace.ownerId !== dbUser.id) {
              return null;
            }

            const newDbSpace: Partial<SpaceShape> & { id: string } = {
              id: oldDbSpace.id,
            };

            if (args.name !== undefined) {
              if (args.name === null) {
                throw new Error('name cannot be null');
              } else {
                newDbSpace.name = args.name;
              }
            }

            if (args.contentVersion !== undefined) {
              if (args.contentVersion === null) {
                throw new Error('contentVersion cannot be null');
              } else if (args.contentVersion === SpaceContentVersion.v3) {
                newDbSpace.contentVersion = DbSpaceContentVersion.v3;
              } else {
                throw new Error(
                  `Invalid contentVersion: ${args.contentVersion}`,
                );
              }
            }

            if (args.contentV3 !== undefined) {
              newDbSpace.contentV3 = nullThrow(args.contentV3);
            }

            const response = await SpaceEntity.update(newDbSpace, {
              returnValues: 'ALL_NEW',
            });

            return new Space(nullThrow(response.Attributes));
          },
        }),
        // TODO: Implement delete space mutation in the frontend
        deleteSpace: t.boolean({
          nullable: true,
          args: {
            id: t.arg({ type: 'ID', required: true }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return false;
            }

            const { Item: dbSpace } = await SpaceEntity.get({ id: dbUser.id });

            if (dbSpace == null) {
              return false;
            }

            if (dbSpace.ownerId !== dbUser.id) {
              return false;
            }

            await SpaceEntity.delete({ id: dbSpace.id });

            return true;
          },
        }),
        createCsvEvaluationPreset: t.field({
          type: CreateCsvEvaluationPresetResult,
          nullable: true,
          args: {
            spaceId: t.arg({ type: 'ID', required: true }),
            name: t.arg({ type: 'String', required: true }),
            csvContent: t.arg({ type: 'String' }),
            configContent: t.arg({ type: 'String' }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const { Item: dbSpace } = await SpaceEntity.get({
              id: args.spaceId as string,
            });

            if (dbSpace == null) {
              return null;
            }

            if (dbSpace.ownerId !== dbUser.id) {
              return null;
            }

            const dbPreset = CsvEvaluationPresetEntity.parse(
              CsvEvaluationPresetEntity.putParams({
                ownerId: dbUser.id,
                spaceId: dbSpace.id,
                name: args.name,
                csvString: args.csvContent ?? '',
                configContentVersion:
                  DbCsvEvaluationPresetConfigContentVersion.v1,
                configContentV1: args.configContent ?? '',
              }),
            );

            await CsvEvaluationPresetEntity.put(dbPreset);

            return {
              space: new Space(dbSpace),
              csvEvaluationPreset: new CsvEvaluationPresetFull(dbPreset),
            };
          },
        }),
        updateCsvEvaluationPreset: t.field({
          type: CsvEvaluationPreset,
          nullable: true,
          args: {
            presetId: t.arg({ type: 'ID', required: true }),
            name: t.arg({ type: 'String' }),
            csvContent: t.arg({ type: 'String' }),
            configContent: t.arg({ type: 'String' }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const { Item: oldDbPreset } = await CsvEvaluationPresetEntity.get({
              id: args.presetId as string,
            });

            if (oldDbPreset == null) {
              return null;
            }

            if (oldDbPreset.ownerId !== dbUser.id) {
              return null;
            }

            const newDbPreset: Partial<CsvEvaluationPresetShape> & {
              id: string;
            } = {
              id: oldDbPreset.id,
            };

            if (args.name !== undefined) {
              if (args.name === null) {
                throw new Error('name cannot be null');
              } else {
                newDbPreset.name = args.name;
              }
            }

            if (args.csvContent !== undefined) {
              if (args.csvContent === null) {
                newDbPreset.csvString = '';
              } else {
                newDbPreset.csvString = args.csvContent;
              }
            }

            if (args.configContent !== undefined) {
              newDbPreset.configContentV1 = nullThrow(args.configContent);
            }

            const response = await CsvEvaluationPresetEntity.update(
              newDbPreset,
              { returnValues: 'ALL_NEW' },
            );

            return new CsvEvaluationPresetFull(nullThrow(response.Attributes));
          },
        }),
        deleteCsvEvaluationPreset: t.field({
          type: Space,
          nullable: true,
          args: {
            id: t.arg({ type: 'ID', required: true }),
          },
          async resolve(parent, args, context) {
            const dbUser = context.req.dbUser;

            if (dbUser == null) {
              return null;
            }

            const { Item: dbPreset } = await CsvEvaluationPresetEntity.get({
              id: args.id as string,
            });

            if (dbPreset == null) {
              return null;
            }

            if (dbPreset.ownerId !== dbUser.id) {
              return null;
            }

            const spaceId = dbPreset.spaceId;

            await CsvEvaluationPresetEntity.delete({ id: dbPreset.id });

            const { Item: dbSpace } = await SpaceEntity.get({ id: spaceId });

            if (dbSpace == null) {
              console.warn(
                'Space not found when deleting CSV Evaluation Preset',
              );
              return null;
            }

            return new Space(dbSpace);
          },
        }),
      };
    },
  });
}

type CreatePlaceholderUserAndExampleSpaceResultShape = {
  placeholderClientToken: string | null;
  space: Space;
};

type CreateCsvEvaluationPresetResultShape = {
  space: Space;
  csvEvaluationPreset: CsvEvaluationPreset;
};
