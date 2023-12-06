import { createOrmClass } from "./orm-utils.js";
import { UUID } from "./types.js";
import { dateToNumber, numberToDate } from "./utils.js";

type CSVEvaluationPresetShape = {
  // Partition key
  id: UUID;

  ownerId: UUID;
  spaceId: UUID;
  name: string;
  csvContent: string;
  configContent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const { findById, buildOrmInstanceFromItem, createOrmInstance } =
  createOrmClass<CSVEvaluationPresetShape>({
    table: process.env.TABLE_NAME_CSV_EVALUATION_PRESETS,
    shape: {
      id: {
        type: "string",
        nullable: false,
        fieldName: "Id",
      },
      ownerId: {
        type: "string",
        nullable: false,
        fieldName: "OwnerId",
      },
      spaceId: {
        type: "string",
        nullable: false,
        fieldName: "SpaceId",
      },
      name: {
        type: "string",
        nullable: false,
        fieldName: "Name",
      },
      csvContent: {
        type: "string",
        nullable: false,
        fieldName: "CsvContent",
      },
      configContent: {
        type: "string",
        nullable: true,
        fieldName: "ConfigContent",
      },
      createdAt: {
        type: "number",
        nullable: false,
        fieldName: "CreatedAt",
        fromDbValue: numberToDate as (val: unknown) => unknown,
        toDbValue: dateToNumber as (val: unknown) => unknown,
      },
      updatedAt: {
        type: "number",
        nullable: false,
        fieldName: "UpdatedAt",
        fromDbValue: numberToDate as (val: unknown) => unknown,
        toDbValue: dateToNumber as (val: unknown) => unknown,
      },
    },
  });

export const createCSVEvaluationPreset = createOrmInstance;
export const findCSVEvaluationPresetById = findById;
export type OrmCsvEvaluationPreset = ReturnType<
  typeof createCSVEvaluationPreset
>;
