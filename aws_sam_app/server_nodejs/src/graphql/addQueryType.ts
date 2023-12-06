import {
  findCSVEvaluationPresetById,
  queryCsvEvaluationPresetsBySpaceId,
} from "../models/csv-evaluation-preset.js";
import { findSpaceById, querySpacesByOwnerId } from "../models/space.js";
import { asUUID } from "../models/types.js";
import { getUserIdByPlaceholderUserToken } from "../models/user.js";
import {
  BuilderType,
  ContentVersion,
  CsvEvaluationPreset,
  Space,
  User,
} from "./graphql-types.js";

export default function addQueryType(builder: BuilderType) {
  builder.queryType({
    fields(t) {
      return {
        hello: t.string({
          resolve(parent, args, context) {
            if (context.req.dbUser?.name) {
              return `Hello ${context.req.dbUser.name}!`;
            }

            return `Hello World!`;
          },
        }),
        isLoggedIn: t.boolean({
          description:
            "Check if there is a user and the user is not a placeholder user",
          resolve(parent, args, context) {
            return (
              context.req.dbUser != null &&
              !context.req.dbUser.isUserPlaceholder
            );
          },
        }),
        isPlaceholderUserTokenInvalid: t.boolean({
          description: "Check if the placeholder user token is invalid",
          async resolve(parent, args, context) {
            const placeholderUserToken = context.req.header(
              "PlaceholderUserToken",
            );

            if (placeholderUserToken == null) {
              // NOTE: If the header is not present, it is not invalid,
              // i.e. it's valid.
              return false;
            }

            const userId = await getUserIdByPlaceholderUserToken(
              asUUID(placeholderUserToken),
            );

            return userId == null;
          },
        }),
        user: t.field({
          type: "User",
          nullable: true,
          async resolve(parent, args, context) {
            // NOTE: Force cast to User because user fetched from DB shouldn't
            // have null id field.
            return context.req.dbUser as User;
          },
        }),
        space: t.field({
          type: "QuerySpaceResult",
          nullable: true,
          args: {
            id: t.arg.string({ required: true }),
          },
          async resolve(parent, args, context) {
            const dbSpace = await findSpaceById(args.id);
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

  builder.objectType("QuerySpaceResult", {
    fields(t) {
      return {
        space: t.field({
          type: "Space",
          resolve(parent, args, context) {
            return parent.space;
          },
        }),
        isReadOnly: t.exposeBoolean("isReadOnly"),
      };
    },
  });

  builder.objectType("User", {
    fields(t) {
      return {
        id: t.exposeString("id"),
        email: t.exposeString("email", { nullable: true }),
        profilePictureUrl: t.exposeString("profilePictureUrl", {
          nullable: true,
        }),
        spaces: t.field({
          type: ["Space"],
          async resolve(parent, args, context) {
            const spaces = await querySpacesByOwnerId(asUUID(parent.id));
            return spaces.map((space) => new Space(space));
          },
        }),
      };
    },
  });

  builder.objectType("Space", {
    fields(t) {
      return {
        id: t.exposeString("id"),
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
          type: "Date",
          resolve(parent, args, context) {
            return parent.updatedAt;
          },
        }),
        csvEvaluationPresets: t.field({
          type: ["CsvEvaluationPreset"],
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
          type: "CsvEvaluationPreset",
          args: {
            id: t.arg.string({ required: true }),
          },
          async resolve(parent, args, context) {
            const dbCsvEvalutionPreset = await findCSVEvaluationPresetById(
              args.id,
            );
            return new CsvEvaluationPreset(dbCsvEvalutionPreset!);
          },
        }),
      };
    },
  });

  builder.enumType(ContentVersion, {
    name: "ContentVersion",
  });
}
