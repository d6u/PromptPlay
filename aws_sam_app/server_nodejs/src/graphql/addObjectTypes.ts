import {
  CsvEvaluationPresetEntity,
  CsvEvaluationPresetsTable,
} from "../models/csv-evaluation-preset";
import { SpaceEntity } from "../models/space";
import {
  BuilderType,
  CsvEvaluationPreset,
  CsvEvaluationPresetFromSpaceIdIndex,
  CsvEvaluationPresetFull,
  Space,
  SpaceContentVersion,
  User,
} from "./graphql-types";

export default function addObjectTypes(builder: BuilderType) {
  builder.objectType(User, {
    name: "User",
    fields(t) {
      return {
        id: t.field({
          type: "UUID",
          resolve(parent, args, context) {
            return parent.dbUser.id;
          },
        }),
        email: t.string({
          nullable: true,
          resolve(parent, args, context) {
            return parent.dbUser.email;
          },
        }),
        profilePictureUrl: t.string({
          nullable: true,
          resolve(parent, args, context) {
            return parent.dbUser.profilePictureUrl;
          },
        }),
        spaces: t.field({
          type: [Space],
          async resolve(parent, args, context) {
            const response = await SpaceEntity.query(parent.dbUser.id, {
              index: "OwnerIdIndex",
              // Parse works because OwnerIdIndex projects all the attributes.
              parseAsEntity: "Space",
            });

            const spaces = response.Items ?? [];

            return spaces.map((space) => new Space(space));
          },
        }),
      };
    },
  });

  builder.objectType(Space, {
    name: "Space",
    fields(t) {
      return {
        id: t.exposeID("id"),
        name: t.exposeString("name"),
        contentVersion: t.field({
          type: SpaceContentVersion,
          resolve(parent, args, context) {
            return parent.contentVersion;
          },
        }),
        content: t.string({
          nullable: true,
          resolve: () => null,
        }),
        flowContent: t.string({
          nullable: true,
          resolve: () => null,
        }),
        contentV3: t.exposeString("contentV3", { nullable: true }),
        updatedAt: t.field({
          type: "DateTime",
          resolve(parent, args, context) {
            return parent.updatedAt;
          },
        }),
        csvEvaluationPresets: t.field({
          type: [CsvEvaluationPreset],
          async resolve(parent, args, context) {
            const response = await CsvEvaluationPresetsTable.query(parent.id, {
              index: "SpaceIdIndex",
            });

            const items = response.Items ?? [];

            return items.map((csvEvaluationPreset) => {
              return new CsvEvaluationPresetFromSpaceIdIndex({
                spaceId: parent.id as string,
                id: csvEvaluationPreset.id as string,
                name: csvEvaluationPreset.name as string,
              });
            });
          },
        }),
        // TODO: This should be null, fix the client side.
        csvEvaluationPreset: t.field({
          type: CsvEvaluationPreset,
          args: {
            id: t.arg({ type: "ID", required: true }),
          },
          async resolve(parent, args, context) {
            const { Item: dbCsvEvaluationPreset } =
              await CsvEvaluationPresetEntity.get({
                id: args.id as string,
              });

            if (dbCsvEvaluationPreset == null) {
              return null;
            }

            return new CsvEvaluationPresetFull(dbCsvEvaluationPreset);
          },
        }),
      };
    },
  });

  builder.objectType(CsvEvaluationPreset, {
    name: "CSVEvaluationPreset",
    fields(t) {
      return {
        id: t.id({
          resolve(parent, args, context) {
            if (
              parent instanceof CsvEvaluationPresetFull ||
              parent instanceof CsvEvaluationPresetFromSpaceIdIndex
            ) {
              return parent.id;
            } else {
              throw new Error(`Invalid parent: ${parent}`);
            }
          },
        }),
        name: t.string({
          resolve(parent, args, context) {
            if (
              parent instanceof CsvEvaluationPresetFull ||
              parent instanceof CsvEvaluationPresetFromSpaceIdIndex
            ) {
              return parent.name;
            } else {
              throw new Error(`Invalid parent: ${parent}`);
            }
          },
        }),
        csvContent: t.string({
          async resolve(parent, args, context) {
            if (parent instanceof CsvEvaluationPresetFull) {
              return parent.csvString;
            } else if (parent instanceof CsvEvaluationPresetFromSpaceIdIndex) {
              return await parent.getCsvContent();
            } else {
              throw new Error(`Invalid parent: ${parent}`);
            }
          },
        }),
        configContent: t.string({
          nullable: true,
          async resolve(parent, args, context) {
            if (parent instanceof CsvEvaluationPresetFull) {
              return parent.configContentV1;
            } else if (parent instanceof CsvEvaluationPresetFromSpaceIdIndex) {
              return await parent.getConfigContent();
            } else {
              throw new Error(`Invalid parent: ${parent}`);
            }
          },
        }),
      };
    },
  });
}
