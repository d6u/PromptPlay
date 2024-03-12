import invariant from 'tiny-invariant';

import {
  BatchTestPresetConfigDataSchemaVersion,
  CanvasDataSchemaVersion,
  PrismaClient,
  UserType,
} from 'database-models';
import {
  CsvEvaluationPresetEntity,
  CsvEvaluationPresetShape,
} from 'dynamodb-models/csv-evaluation-preset.js';
import {
  PlaceholderUserEntity,
  PlaceholderUserShape,
} from 'dynamodb-models/placeholder-user.js';
import { SpaceEntity, SpaceShape } from 'dynamodb-models/space.js';
import { UserEntity, UserShape } from 'dynamodb-models/user.js';

const prisma = new PrismaClient();

async function importRegularUsers() {
  let total = 0;

  let response = await UserEntity.scan({ limit: 25 });

  while (true) {
    invariant(
      response.Count != null && response.Items != null,
      'response.Count and response.Items should not be null',
    );

    console.log(`Processing user ${total} to ${total + response.Count}`);

    total += response.Count;

    await Promise.all(
      response.Items.map(async (_item) => {
        const item = _item as UserShape;

        return await prisma.user.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            userType: UserType.RegisteredUser,
            email: item.email,
            name: item.name,
            profilePictureUrl: item.profilePictureUrl,
            auth0UserId: item.auth0UserId,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          },
        });
      }),
    );

    if (response.Count < 10 || response.next == null) {
      break;
    }

    response = await response.next();
  }

  console.log(`Finished, processed ${total} users in total`);
}

async function importPlaceholderUsers() {
  let total = 0;

  let response = await PlaceholderUserEntity.scan({ limit: 25 });

  while (true) {
    invariant(
      response.Count != null && response.Items != null,
      'response.Count and response.Items should not be null',
    );

    console.log(
      `Processing placeholder user ${total} to ${total + response.Count}`,
    );

    total += response.Count;

    await Promise.all(
      response.Items.map(async (_item) => {
        const item = _item as PlaceholderUserShape;

        return await prisma.user.upsert({
          where: { id: item.placeholderClientToken },
          update: {},
          create: {
            id: item.placeholderClientToken,
            userType: UserType.PlaceholderUser,
            placeholderClientToken: item.placeholderClientToken,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          },
        });
      }),
    );

    if (response.Count < 10 || response.next == null) {
      break;
    }

    response = await response.next();
  }

  console.log(`Finished, processed ${total} users in total`);
}

async function importFlows() {
  let total = 0;
  let failed = 0;

  let response = await SpaceEntity.scan({ limit: 25 });

  while (true) {
    invariant(
      response.Count != null && response.Items != null,
      'response.Count and response.Items should not be null',
    );

    console.log(`Processing space ${total} to ${total + response.Count}`);

    total += response.Count;

    await Promise.all(
      response.Items.map(async (_item) => {
        const item = _item as SpaceShape;

        try {
          return await prisma.flow.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              name: item.name,
              canvasDataSchemaVersion: CanvasDataSchemaVersion.V3,
              canvasDataV3: item.contentV3,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              userId: item.ownerId,
            },
          });
        } catch (error) {
          // console.error(error);
          // console.log(item);
          failed++;
          return null;
        }
      }),
    );

    if (response.Count < 10 || response.next == null) {
      break;
    }

    response = await response.next();
  }

  console.log(
    `Finished, processed ${total} spaces in total, ${failed} failed to import, succeeded ${
      total - failed
    }`,
  );
}

async function importBatchTests() {
  let total = 0;

  let response = await CsvEvaluationPresetEntity.scan({ limit: 25 });

  while (true) {
    invariant(
      response.Count != null && response.Items != null,
      'response.Count and response.Items should not be null',
    );

    console.log(`Processing batch tests ${total} to ${total + response.Count}`);

    total += response.Count;

    await Promise.all(
      response.Items.map(async (_item) => {
        const item = _item as CsvEvaluationPresetShape;

        return await prisma.batchTestPreset.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            name: item.name,
            csv: item.csvString,
            configDataSchemaVersion: BatchTestPresetConfigDataSchemaVersion.V1,
            configDataV1: item.configContentV1,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            userId: item.ownerId,
            flowId: item.spaceId,
          },
        });
      }),
    );

    if (response.Count < 10 || response.next == null) {
      break;
    }

    response = await response.next();
  }

  console.log(`Finished, processed ${total} batch tests in total`);
}

async function main() {
  await importRegularUsers();
  await importPlaceholderUsers();
  await importFlows();
  await importBatchTests();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
