import {
  CanvasDataSchemaVersion,
  UserType,
  prismaClient,
} from 'database-models';
import builder, {
  GraphQlCreateCsvEvaluationPresetResult,
  GraphQlCsvEvaluationPreset,
  GraphQlQuerySpaceResult,
  GraphQlSpace,
  GraphQlUser,
} from './schemaBuilder';

builder.objectType(GraphQlUser, {
  fields(t) {
    return {
      isPlaceholderUser: t.boolean({
        resolve(parent, args, context) {
          return parent.userType === UserType.PlaceholderUser;
        },
      }),
      id: t.field({
        type: 'UUID',
        resolve(parent, args, context) {
          return parent.id;
        },
      }),
      email: t.string({
        nullable: true,
        resolve(parent, args, context) {
          return parent.email;
        },
      }),
      profilePictureUrl: t.string({
        nullable: true,
        resolve(parent, args, context) {
          return parent.profilePictureUrl;
        },
      }),
      spaces: t.field({
        type: [GraphQlSpace],
        async resolve(parent, args, context) {
          const flows = await prismaClient.flow.findMany({
            where: { userId: parent.id },
            orderBy: { updatedAt: 'desc' },
          });

          return flows;
        },
      }),
    };
  },
});

builder.objectType(GraphQlSpace, {
  fields(t) {
    return {
      id: t.exposeID('id'),
      name: t.exposeString('name'),
      canvasDataSchemaVersion: t.field({
        type: CanvasDataSchemaVersion,
        resolve(parent, args, context) {
          return parent.canvasDataSchemaVersion;
        },
      }),
      canvasData: t.field({
        nullable: true,
        type: 'String',
        resolve(parent, args, context) {
          switch (parent.canvasDataSchemaVersion) {
            case CanvasDataSchemaVersion.v3:
              return JSON.stringify(parent.canvasDataV3);
            case CanvasDataSchemaVersion.v4:
              return JSON.stringify(parent.canvasDataV4);
          }
        },
      }),
      updatedAt: t.field({
        type: 'DateTime',
        resolve(parent, args, context) {
          return parent.updatedAt;
        },
      }),
      csvEvaluationPresets: t.field({
        type: [GraphQlCsvEvaluationPreset],
        async resolve(parent, args, context) {
          const batchTestPresets = await prismaClient.batchTestPreset.findMany({
            where: { flowId: parent.id },
            orderBy: { createdAt: 'desc' },
          });

          return batchTestPresets;
        },
      }),
      csvEvaluationPreset: t.field({
        type: GraphQlCsvEvaluationPreset,
        args: {
          id: t.arg({ type: 'ID', required: true }),
        },
        async resolve(parent, args, context) {
          const batchTestPreset = await prismaClient.batchTestPreset.findUnique(
            {
              where: { id: args.id as string },
            },
          );

          // TODO: This should be nullable, fix the client side first then fix
          // here.
          return batchTestPreset!;
        },
      }),
    };
  },
});

builder.objectType(GraphQlQuerySpaceResult, {
  fields(t) {
    return {
      space: t.field({
        type: GraphQlSpace,
        resolve(parent, args, context) {
          return parent.space;
        },
      }),
      isReadOnly: t.exposeBoolean('isReadOnly'),
    };
  },
});

builder.objectType(GraphQlCsvEvaluationPreset, {
  name: 'CSVEvaluationPreset',
  fields(t) {
    return {
      id: t.exposeID('id'),
      name: t.exposeString('name'),
      csvContent: t.exposeString('csv'),
      configContent: t.string({
        nullable: true,
        async resolve(parent, args, context) {
          return JSON.stringify(parent.configDataV1);
        },
      }),
    };
  },
});

builder.objectType(GraphQlCreateCsvEvaluationPresetResult, {
  fields(t) {
    return {
      space: t.field({
        type: GraphQlSpace,
        resolve(parent) {
          return parent.space;
        },
      }),
      csvEvaluationPreset: t.field({
        type: GraphQlCsvEvaluationPreset,
        resolve(parent) {
          return parent.csvEvaluationPreset;
        },
      }),
    };
  },
});
