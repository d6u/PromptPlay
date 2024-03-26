import invariant from 'tiny-invariant';

import {
  BatchTestPresetConfigDataSchemaVersion,
  CanvasDataSchemaVersion,
  prismaClient,
  UserType,
} from 'database-models';
import {
  CsvEvaluationPresetEntity,
  CsvEvaluationPresetShape,
} from 'dynamodb-models/csv-evaluation-preset';
import {
  PlaceholderUserEntity,
  PlaceholderUserShape,
} from 'dynamodb-models/placeholder-user';
import { SpaceEntity, SpaceShape } from 'dynamodb-models/space';
import { UserEntity, UserShape } from 'dynamodb-models/user';
import { migrateV3ToV4 } from 'flow-models';

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

        await prismaClient.user.upsert({
          where: { id: item.id },
          update: {
            email: item.email,
            name: item.name,
            profilePictureUrl: item.profilePictureUrl,
            auth0UserId: item.auth0UserId,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          },
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

        await prismaClient.user.upsert({
          where: { id: item.placeholderClientToken },
          update: {
            placeholderClientToken: item.placeholderClientToken,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          },
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

        const canvasDataV3 = JSON.parse(item.contentV3);

        const canvasDataV4 = migrateV3ToV4(canvasDataV3);

        try {
          await prismaClient.flow.upsert({
            where: { id: item.id },
            update: {
              name: item.name,
              canvasDataSchemaVersion: CanvasDataSchemaVersion.v4,
              canvasDataV3: canvasDataV3,
              canvasDataV4: canvasDataV4,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              User: {
                connect: { id: item.ownerId },
              },
            },
            create: {
              id: item.id,
              name: item.name,
              canvasDataSchemaVersion: CanvasDataSchemaVersion.v4,
              canvasDataV3: canvasDataV3,
              canvasDataV4: canvasDataV4,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              User: {
                connect: { id: item.ownerId },
              },
            },
          });
        } catch (error) {
          // console.error(error);
          // console.log(item);
          failed++;
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

        await prismaClient.batchTestPreset.upsert({
          where: { id: item.id },
          update: {
            csv: item.csvString,
            configDataSchemaVersion: BatchTestPresetConfigDataSchemaVersion.v1,
            configDataV1: item.configContentV1,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            User: {
              connect: { id: item.ownerId },
            },
            Flow: {
              connect: { id: item.spaceId },
            },
          },
          create: {
            id: item.id,
            name: item.name,
            csv: item.csvString,
            configDataSchemaVersion: BatchTestPresetConfigDataSchemaVersion.v1,
            configDataV1: item.configContentV1,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            User: {
              connect: { id: item.ownerId },
            },
            Flow: {
              connect: { id: item.spaceId },
            },
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
  // await importRegularUsers();
  // await importPlaceholderUsers();
  await importFlows();
  // await importBatchTests();
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prismaClient.$disconnect();
    process.exit(1);
  });
