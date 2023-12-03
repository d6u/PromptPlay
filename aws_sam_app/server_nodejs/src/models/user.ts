import { createOrmClass } from "./orm-utils.js";
import { UUID } from "./types.js";

type UserShape = {
  id: UUID;
  isUserPlaceholder: boolean;
  name: string | null;
  email: string | null;
  profilePictureUrl: string | null;
  auth0UserId: string | null;
  placeholderClientToken: UUID | null;
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
  },
});

export const createOrmUserInstance = createOrmInstance;
export const findUserById = findById;
export type OrmUser = ReturnType<typeof createOrmInstance>;
