import {
  BatchTestPresetConfigDataSchemaVersion,
  CanvasDataSchemaVersion,
  Prisma,
  UserType,
  createSpaceWithExampleContent,
  prismaClient,
} from 'database-models';
import { v4 as uuidv4 } from 'uuid';
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

          return await prismaClient.flow.create({
            data: createSpaceWithExampleContent(user.id),
          });
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
              name: 'Untitled',
              canvasDataSchemaVersion: CanvasDataSchemaVersion.v3,
              canvasDataV3: Prisma.JsonNull,
              User: {
                connect: { id: user.id },
              },
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
          contentV3: t.arg({ type: 'String' }),
          canvasDataV4: t.arg({ type: 'String' }),
        },
        nullable: true,
        async resolve(parent, args, context) {
          const user = context.req.user;

          if (user == null) {
            return null;
          }

          const flowUpdateData: Prisma.FlowUpdateInput = {};

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
            if (args.contentV3 === null) {
              throw new Error('contentV3 cannot be null');
            } else {
              flowUpdateData.canvasDataV3 = args.contentV3;
            }
          }

          if (args.canvasDataV4 !== undefined) {
            if (args.canvasDataV4 === null) {
              throw new Error('canvasDataV4 cannot be null');
            } else {
              console.log('---> update v4');
              flowUpdateData.canvasDataV4 = args.canvasDataV4;
            }
          }

          return await prismaClient.$transaction(async (tx) => {
            const flow = await tx.flow.findUnique({
              where: {
                id: args.id as string,
                userId: user.id,
              },
            });

            // Update will throw if the record is not found
            if (flow == null) {
              return null;
            }

            return await tx.flow.update({
              where: { id: args.id as string },
              data: flowUpdateData,
            });
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

          return await prismaClient.$transaction(async (tx) => {
            const flow = await tx.flow.findUnique({
              where: {
                id: args.id as string,
                userId: user.id,
              },
            });

            if (flow == null) {
              return false;
            }

            await tx.flow.delete({ where: { id: flow.id } });

            return true;
          });
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

          return await prismaClient.$transaction(async (tx) => {
            const flow = await tx.flow.findUnique({
              where: {
                id: args.spaceId as string,
                userId: user.id,
              },
            });

            if (flow == null) {
              return null;
            }

            const batchTestPreset = await tx.batchTestPreset.create({
              data: {
                name: args.name,
                csv: args.csvContent ?? '',
                configDataSchemaVersion:
                  BatchTestPresetConfigDataSchemaVersion.v1,
                configDataV1: Prisma.JsonNull,
                User: {
                  connect: { id: user.id },
                },
                Flow: {
                  connect: { id: flow.id },
                },
              },
            });

            return {
              space: flow,
              csvEvaluationPreset: batchTestPreset,
            };
          });
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
          const user = context.req.user;

          if (user == null) {
            return null;
          }

          const batchTestPresetUpdateData: Prisma.BatchTestPresetUpdateInput =
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
            if (args.configContent === null) {
              throw new Error('configContent cannot be null');
            } else {
              batchTestPresetUpdateData.configDataV1 = args.configContent;
            }
          }

          return await prismaClient.$transaction(async (tx) => {
            const batchTestPreset = await tx.batchTestPreset.findUnique({
              where: {
                id: args.presetId as string,
                userId: user.id,
              },
            });

            // Update will throw if the record is not found
            if (batchTestPreset == null) {
              return null;
            }

            return await tx.batchTestPreset.update({
              where: { id: args.presetId as string },
              data: batchTestPresetUpdateData,
            });
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

          return await prismaClient.$transaction(async (tx) => {
            const batchTestPreset = await tx.batchTestPreset.findUnique({
              where: {
                id: args.id as string,
                userId: user.id,
              },
            });

            if (batchTestPreset == null) {
              return null;
            }

            await tx.batchTestPreset.delete({
              where: { id: args.id as string },
            });

            return await tx.flow.findUnique({
              where: { id: batchTestPreset.flowId },
            });
          });
        },
      }),
    };
  },
});
