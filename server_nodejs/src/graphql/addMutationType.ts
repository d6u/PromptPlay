import {
  BatchTestPresetConfigDataSchemaVersion,
  CanvasDataSchemaVersion,
  Prisma,
  UserType,
  createSpaceWithExampleContent,
  prismaClient,
} from 'database-models';
import { v4 as uuidv4 } from 'uuid';
import { nullThrow } from '../utils/utils';
import builder, {
  GraphQlCreateCsvEvaluationPresetResult,
  GraphQlCsvEvaluationPreset,
  GraphQlSpace,
} from './schemaBuilder';

builder.mutationType({
  fields(t) {
    return {
      createExampleSpace: t.field({
        type: GraphQlSpace,
        async resolve(parent, args, context) {
          let user = context.req.user;

          if (user == null) {
            user = await prismaClient.user.create({
              data: {
                userType: UserType.PlaceholderUser,
                placeholderClientToken: uuidv4(),
              },
            });

            context.req.session!.placeholderUserToken =
              user.placeholderClientToken ?? undefined;
          }

          const flow = createSpaceWithExampleContent(user.id);

          return await prismaClient.flow.create({ data: flow });
        },
      }),
      createSpace: t.field({
        type: GraphQlSpace,
        nullable: true,
        async resolve(parent, args, context) {
          const user = context.req.user;

          if (user == null) {
            return null;
          }

          return await prismaClient.flow.create({
            data: {
              userId: user.id,
              name: 'Untitled',
              canvasDataSchemaVersion: CanvasDataSchemaVersion.V3,
              canvasDataV3: JSON.stringify({}),
            },
          });
        },
      }),
      updateSpace: t.field({
        type: GraphQlSpace,
        args: {
          id: t.arg({ type: 'ID', required: true }),
          name: t.arg({ type: 'String' }),
          contentVersion: t.arg({ type: CanvasDataSchemaVersion }),
          content: t.arg({ type: 'String' }),
          flowContent: t.arg({ type: 'String' }),
          contentV3: t.arg({ type: 'String' }),
        },
        nullable: true,
        async resolve(parent, args, context) {
          const user = context.req.user;

          if (user == null) {
            return null;
          }

          const flowUpdateData: Prisma.FlowUncheckedUpdateInput = {};

          if (args.name !== undefined) {
            if (args.name === null) {
              throw new Error('name cannot be null');
            } else {
              flowUpdateData.name = args.name;
            }
          }

          if (args.contentVersion !== undefined) {
            if (args.contentVersion === null) {
              throw new Error('contentVersion cannot be null');
            } else {
              flowUpdateData.canvasDataSchemaVersion = args.contentVersion;
            }
          }

          if (args.contentV3 !== undefined) {
            flowUpdateData.canvasDataV3 = nullThrow(args.contentV3);
          }

          return await prismaClient.flow.update({
            where: { id: args.id as string, userId: user.id },
            data: flowUpdateData,
          });
        },
      }),
      // TODO: Implement delete space mutation in the frontend
      deleteSpace: t.boolean({
        nullable: true,
        args: {
          id: t.arg({ type: 'ID', required: true }),
        },
        async resolve(parent, args, context) {
          const user = context.req.user;

          if (user == null) {
            return false;
          }

          const flow = await prismaClient.flow.findUnique({
            where: { id: args.id as string, userId: user.id },
          });

          if (flow == null) {
            return false;
          }

          await prismaClient.flow.delete({ where: { id: flow.id } });

          return true;
        },
      }),
      createCsvEvaluationPreset: t.field({
        type: GraphQlCreateCsvEvaluationPresetResult,
        nullable: true,
        args: {
          spaceId: t.arg({ type: 'ID', required: true }),
          name: t.arg({ type: 'String', required: true }),
          csvContent: t.arg({ type: 'String' }),
          configContent: t.arg({ type: 'String' }),
        },
        async resolve(parent, args, context) {
          const user = context.req.user;

          if (user == null) {
            return null;
          }

          const flow = await prismaClient.flow.findUnique({
            where: {
              id: args.spaceId as string,
              userId: user.id,
            },
          });

          if (flow == null) {
            return null;
          }

          const batchTestPreset = await prismaClient.batchTestPreset.create({
            data: {
              userId: user.id,
              flowId: flow.id,
              name: args.name,
              csv: args.csvContent ?? '',
              configDataSchemaVersion:
                BatchTestPresetConfigDataSchemaVersion.V1,
              configDataV1: args.configContent ?? '',
            },
          });

          return {
            space: flow,
            csvEvaluationPreset: batchTestPreset,
          };
        },
      }),
      updateCsvEvaluationPreset: t.field({
        type: GraphQlCsvEvaluationPreset,
        nullable: true,
        args: {
          presetId: t.arg({ type: 'ID', required: true }),
          name: t.arg({ type: 'String' }),
          csvContent: t.arg({ type: 'String' }),
          configContent: t.arg({ type: 'String' }),
        },
        async resolve(parent, args, context) {
          const dbUser = context.req.user;

          if (dbUser == null) {
            return null;
          }

          const batchTestPresetUpdateData: Prisma.BatchTestPresetUncheckedUpdateInput =
            {};

          if (args.name !== undefined) {
            if (args.name === null) {
              throw new Error('name cannot be null');
            } else {
              batchTestPresetUpdateData.name = args.name;
            }
          }

          if (args.csvContent !== undefined) {
            if (args.csvContent === null) {
              batchTestPresetUpdateData.csv = '';
            } else {
              batchTestPresetUpdateData.csv = args.csvContent;
            }
          }

          if (args.configContent !== undefined) {
            batchTestPresetUpdateData.configDataV1 = nullThrow(
              args.configContent,
            );
          }

          return await prismaClient.batchTestPreset.update({
            where: {
              id: args.presetId as string,
              userId: dbUser.id,
            },
            data: batchTestPresetUpdateData,
          });
        },
      }),
      deleteCsvEvaluationPreset: t.field({
        type: GraphQlSpace,
        nullable: true,
        args: {
          id: t.arg({ type: 'ID', required: true }),
        },
        async resolve(parent, args, context) {
          const user = context.req.user;

          if (user == null) {
            return null;
          }

          const batchTestPreset = await prismaClient.batchTestPreset.findUnique(
            {
              where: {
                id: args.id as string,
                userId: user.id,
              },
            },
          );

          if (batchTestPreset == null) {
            return null;
          }

          const flowId = batchTestPreset.flowId!;

          await prismaClient.batchTestPreset.delete({
            where: { id: flowId },
          });

          const flow = await prismaClient.flow.findUnique({
            where: { id: flowId },
          });

          if (flow == null) {
            console.warn('Space not found when deleting CSV Evaluation Preset');
            return null;
          }

          return flow;
        },
      }),
    };
  },
});
