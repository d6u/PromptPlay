import { createOrmClass } from "./orm-utils.js";
import { UUID } from "./types.js";
import { dateToNumber, numberToDate } from "./utils.js";

type UserShape = {
  id: UUID;
  isUserPlaceholder: boolean;
  name: string | null;
  email: string | null;
  profilePictureUrl: string | null;
  auth0UserId: string | null;
  placeholderClientToken: UUID | null;
  createdAt: Date;
  updatedAt: Date;
};

const { createOrmInstance, findById } = createOrmClass<UserShape>({
  table: process.env.TABLE_NAME_USERS,
  shape: {
    id: {
      type: "string",
      nullable: false,
      fieldName: "Id",
    },
    isUserPlaceholder: {
      type: "boolean",
      nullable: false,
      fieldName: "IsUserPlaceholder",
    },
    name: {
      type: "string",
      nullable: true,
      fieldName: "Name",
    },
    email: {
      type: "string",
      nullable: true,
      fieldName: "Email",
    },
    profilePictureUrl: {
      type: "string",
      nullable: true,
      fieldName: "ProfilePictureUrl",
    },
    auth0UserId: {
      type: "string",
      nullable: true,
      fieldName: "Auth0UserId",
    },
    placeholderClientToken: {
      type: "string",
      nullable: true,
      fieldName: "PlaceholderClientToken",
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

export const createOrmUserInstance = createOrmInstance;
export const findUserById = findById;
export type OrmUser = ReturnType<typeof createOrmInstance>;
