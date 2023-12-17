import {
  CsvEvaluationPresetEntity,
  CsvEvaluationPresetsTable,
  DbCsvEvaluationPresetConfigContentVersion,
} from 'dynamodb-models/csv-evaluation-preset';
import {
  PlaceholderUserEntity,
  PlaceholderUserShape,
  PlaceholderUsersTable,
} from 'dynamodb-models/placeholder-user';
import {
  DbSpaceContentVersion,
  SpaceEntity,
  SpaceShape,
  SpacesTable,
} from 'dynamodb-models/space';
import { UserEntity, UserShape, UsersTable } from 'dynamodb-models/user';
import { FlowContent } from 'flow-models/v2-flow-content-types';
import { convertV2ContentToV3Content } from 'flow-models/v2-to-v3-flow-utils';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Postgres
      POSTGRES_HOST: string;
      POSTGRES_PORT: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DATABASE_NAME: string;

      // DynamoDB
      DYNAMODB_TABLE_NAME_USERS: string;
      DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS: string;
      DYNAMODB_TABLE_NAME_SPACES: string;
      DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS: string;

      // dev only, undefined in prod
      DEV_DYNAMODB_ENDPOINT?: string;
    }
  }
}

const sequelize = new Sequelize({
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DATABASE_NAME,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare isUserPlaceholder: string;
  declare auth0UserId: string | null;
  declare name: string | null;
  declare email: string | null;
  declare profilePictureUrl: string | null;
  declare placeholderClientToken: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    isUserPlaceholder: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    auth0UserId: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    profilePictureUrl: {
      type: DataTypes.STRING,
    },
    placeholderClientToken: {
      type: DataTypes.STRING,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  },
);

class Space extends Model<
  InferAttributes<Space>,
  InferCreationAttributes<Space>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare contentVersion: string | null;
  declare content: object | null;
  declare flowContent: object | null;
  declare contentV3: object | null;
  declare ownerId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Space.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentVersion: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.JSONB,
    },
    flowContent: {
      type: DataTypes.JSONB,
    },
    contentV3: {
      type: DataTypes.JSONB,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Space',
    tableName: 'spaces',
    underscored: true,
  },
);

class CsvEvaluationPreset extends Model<
  InferAttributes<CsvEvaluationPreset>,
  InferCreationAttributes<CsvEvaluationPreset>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare csvContent: string;
  declare configContent: object | null;
  declare ownerId: string;
  declare spaceId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CsvEvaluationPreset.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    csvContent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    configContent: {
      type: DataTypes.JSONB,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    spaceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'CsvEvaluationPreset',
    tableName: 'csv_evaluation_presets',
    underscored: true,
  },
);

async function putUsers(users: User[]) {
  const usersObj: UserShape[] = users
    .filter((user) => {
      return !user.isUserPlaceholder;
    })
    .map((user) => {
      return {
        id: user.id,
        auth0UserId: user.auth0UserId ?? undefined,
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        profilePictureUrl: user.profilePictureUrl ?? undefined,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      };
    });

  for (let i = 0; i < usersObj.length; i += 25) {
    const response = await UsersTable.batchWrite(
      usersObj.slice(i, i + 25).map((obj) => {
        return UserEntity.putBatch(obj);
      }),
    );

    if (
      response.$metadata.httpStatusCode !== 200 ||
      Object.keys(response.UnprocessedItems).length !== 0
    ) {
      console.log(response);
    }
  }

  console.log(`Inserted ${usersObj.length} users`);
}

async function putPlaceholderUsers(users: User[]) {
  const usersObj: PlaceholderUserShape[] = users
    .filter((user) => {
      return user.isUserPlaceholder && user.placeholderClientToken != null;
    })
    .map((user) => {
      return {
        placeholderClientToken: user.placeholderClientToken!,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      };
    });

  for (let i = 0; i < usersObj.length; i += 25) {
    const response = await PlaceholderUsersTable.batchWrite(
      usersObj.slice(i, i + 25).map((obj) => {
        return PlaceholderUserEntity.putBatch(obj);
      }),
    );

    if (
      response.$metadata.httpStatusCode !== 200 ||
      Object.keys(response.UnprocessedItems).length !== 0
    ) {
      console.log(response);
    }
  }

  console.log(`Inserted ${usersObj.length} placeholder users`);
}

async function putSpaces(spaces: Space[]) {
  const versionCounts: Record<string, number> = {};

  const spacesObj: SpaceShape[] = spaces
    .filter((space) => {
      return space.contentVersion != null;
    })
    .map((space) => {
      let contentV3String: string;
      if (space.contentVersion === DbSpaceContentVersion.v3) {
        contentV3String = JSON.stringify(space.contentV3);
      } else {
        // Must by v2
        if (space.flowContent == null) {
          throw new Error('Flow content is null');
        }
        contentV3String = JSON.stringify(
          convertV2ContentToV3Content(space.flowContent as FlowContent),
        );
        console.log(
          'space id: ' + space.id + ' item size: ' + contentV3String.length,
        );
      }

      const key = space.contentVersion!;
      if (versionCounts[key] == null) {
        versionCounts[key] = 0;
      }
      versionCounts[key] += 1;

      return {
        id: space.id,
        ownerId: space.ownerId,
        name: space.name,
        contentVersion: DbSpaceContentVersion.v3,
        contentV3: contentV3String,
        createdAt: space.createdAt.getTime(),
        updatedAt: space.updatedAt.getTime(),
      };
    });

  const BATCH_SIZE = 5;

  for (let i = 0; i < spacesObj.length; i += BATCH_SIZE) {
    console.log(`Inserting ${i} to ${i + BATCH_SIZE - 1} spaces`);

    try {
      const response = await SpacesTable.batchWrite(
        spacesObj.slice(i, i + BATCH_SIZE).map((obj) => {
          return SpaceEntity.putBatch(obj);
        }),
      );

      if (
        response.$metadata.httpStatusCode !== 200 ||
        Object.keys(response.UnprocessedItems).length !== 0
      ) {
        console.log(response);
      }
    } catch (err) {
      console.log(spacesObj.slice(i, i + BATCH_SIZE));
      throw err;
    }
  }

  console.log(versionCounts);
  console.log(`Inserted ${spacesObj.length} spaces`);
}

async function putCsvEvaluationPresets(presets: CsvEvaluationPreset[]) {
  const csvEvaluationPresetObjs = presets.map((preset) => {
    const configString = JSON.stringify(preset.configContent);

    return {
      id: preset.id,
      ownerId: preset.ownerId,
      spaceId: preset.spaceId,
      name: preset.name,
      csvString: preset.csvContent,
      configContentVersion: DbCsvEvaluationPresetConfigContentVersion.v1,
      configContentV1: configString,
      createdAt: preset.createdAt.getTime(),
      updatedAt: preset.updatedAt.getTime(),
    };
  });

  for (let i = 0; i < csvEvaluationPresetObjs.length; i += 25) {
    const response = await CsvEvaluationPresetsTable.batchWrite(
      csvEvaluationPresetObjs.slice(i, i + 25).map((obj) => {
        return CsvEvaluationPresetEntity.putBatch(obj);
      }),
    );

    if (
      response.$metadata.httpStatusCode !== 200 ||
      Object.keys(response.UnprocessedItems).length !== 0
    ) {
      console.log(response);
    }
  }

  console.log(
    `Inserted ${csvEvaluationPresetObjs.length} csv evaluation presets`,
  );
}

(async () => {
  await sequelize.authenticate();

  const users = await User.findAll();
  const spaces = await Space.findAll();
  const csvEvaluationPresets = await CsvEvaluationPreset.findAll();

  await putUsers(users);
  await putPlaceholderUsers(users);
  await putSpaces(spaces);
  await putCsvEvaluationPresets(csvEvaluationPresets);

  console.log(
    `Found ${users.length} users, ${spaces.length} spaces and ${csvEvaluationPresets.length} csv evaluation presets`,
  );

  sequelize.close();
})();
