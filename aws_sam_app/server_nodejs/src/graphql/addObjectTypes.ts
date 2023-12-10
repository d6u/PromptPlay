import {
  findCSVEvaluationPresetById,
  queryCsvEvaluationPresetsBySpaceId,
} from "../models/csv-evaluation-preset";
import { querySpacesByOwnerId } from "../models/space";
import { asUUID } from "../models/types";
import {
  BuilderType,
  ContentVersion,
  CsvEvaluationPreset,
  Space,
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
            const spaces = await querySpacesByOwnerId(parent.dbUser.id);
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
          type: ContentVersion,
          resolve(parent, args, context) {
            return parent.contentVersion;
          },
        }),
        content: t.exposeString("content", { nullable: true }),
        flowContent: t.exposeString("flowContent", { nullable: true }),
        contentV3: t.exposeString("contentV3", { nullable: true }),
        updatedAt: t.field({
          type: "DateTime",
          resolve(parent, args, context) {
            return parent.updatedAt;
          },
        }),
        csvEvaluationPresets: t.field({
          type: ["CSVEvaluationPreset"],
          async resolve(parent, args, context) {
            const csvEvaluationPresets =
              await queryCsvEvaluationPresetsBySpaceId(asUUID(parent.id));

            // TODO: Improve the efficiency of this query.
            return await Promise.all(
              csvEvaluationPresets.map(async (csvEvaluationPreset) => {
                const dbCsvEvaluationPreset = await findCSVEvaluationPresetById(
                  csvEvaluationPreset.id,
                );
                return new CsvEvaluationPreset(dbCsvEvaluationPreset!);
              }),
            );
          },
        }),
        // TODO: This should be null, fix the client side.
        csvEvaluationPreset: t.field({
          type: "CSVEvaluationPreset",
          args: {
            id: t.arg({ type: "ID", required: true }),
          },
          async resolve(parent, args, context) {
            const dbCsvEvalutionPreset = await findCSVEvaluationPresetById(
              args.id as string,
            );
            return new CsvEvaluationPreset(dbCsvEvalutionPreset!);
          },
        }),
      };
    },
  });

  builder.objectType("QuerySpaceResult", {
    fields(t) {
      return {
        space: t.field({
          type: Space,
          resolve(parent, args, context) {
            return parent.space;
          },
        }),
        isReadOnly: t.exposeBoolean("isReadOnly"),
      };
    },
  });

  builder.objectType("CSVEvaluationPreset", {
    fields(t) {
      return {
        id: t.exposeID("id"),
        name: t.exposeString("name"),
        csvContent: t.exposeString("csvContent"),
        configContent: t.exposeString("configContent", { nullable: true }),
      };
    },
  });
}
