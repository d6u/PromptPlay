import {
  CanvasDataSchemaVersion,
  Prisma,
  PrismaClient,
  User,
  UserType,
} from '@prisma/client';

export * from '@prisma/client';

export const prismaClient = new PrismaClient();

export type RegisteredUser = Omit<User, 'placeholderClientToken'> & {
  userType: typeof UserType.RegisteredUser;
};

export type PlaceholderUser = Omit<
  User,
  'email' | 'name' | 'profilePictureUrl' | 'auth0UserId'
> & {
  userType: typeof UserType.PlaceholderUser;
};

export function toSpecificUser(user: User): RegisteredUser | PlaceholderUser {
  if (user.userType === UserType.PlaceholderUser) {
    return user as PlaceholderUser;
  }

  return user as RegisteredUser;
}

export function createSpaceWithExampleContent(
  userId: string,
): Prisma.FlowCreateInput {
  return {
    name: 'Example Space',
    canvasDataSchemaVersion: CanvasDataSchemaVersion.v3,
    canvasDataV3: createExampleSpaceContentV3(),
    User: {
      connect: { id: userId },
    },
  };
}

function createExampleSpaceContentV3(): Prisma.InputJsonObject {
  return {
    edges: [
      {
        id: 'JgDcR',
        source: '7pl1l',
        target: 'SpmQE',
        sourceHandle: '7pl1l/vCths',
        targetHandle: 'SpmQE/9n6vr',
      },
      {
        id: 'WMmsm',
        source: 'SpmQE',
        target: '3LMD6',
        sourceHandle: 'SpmQE/messages_out',
        targetHandle: '3LMD6/messages_in',
      },
      {
        id: 'izsvd',
        source: '3LMD6',
        target: 'fXtmo',
        sourceHandle: '3LMD6/content',
        targetHandle: 'fXtmo/awpiF',
      },
    ],
    nodes: [
      {
        id: '7pl1l',
        data: null,
        type: 'InputNode',
        position: { x: 285.09118547422656, y: 101.36529230534379 },
      },
      {
        id: '3LMD6',
        data: null,
        type: 'ChatGPTChatCompletionNode',
        position: { x: 1130.4726993985755, y: -161.27869905926627 },
      },
      {
        id: 'SpmQE',
        data: null,
        type: 'ChatGPTMessageNode',
        position: { x: 678.3046012028486, y: -73.72654279097594 },
      },
      {
        id: 'fXtmo',
        data: null,
        type: 'OutputNode',
        position: { x: 1532.7693161756567, y: 110.24381088669739 },
      },
    ],
    variablesDict: {
      '7pl1l/vCths': {
        id: '7pl1l/vCths',
        name: 'in_topic',
        type: 'FlowInput',
        index: 0,
        nodeId: '7pl1l',
        valueType: 'String',
      },
      'SpmQE/9n6vr': {
        id: 'SpmQE/9n6vr',
        name: 'topic',
        type: 'NodeInput',
        index: 1,
        nodeId: 'SpmQE',
        valueType: 'Unknown',
      },
      'fXtmo/awpiF': {
        id: 'fXtmo/awpiF',
        name: 'poem',
        type: 'FlowOutput',
        index: 0,
        nodeId: 'fXtmo',
        valueType: 'String',
      },
      '3LMD6/content': {
        id: '3LMD6/content',
        name: 'content',
        type: 'NodeOutput',
        index: 0,
        nodeId: '3LMD6',
        valueType: 'Unknown',
      },
      '3LMD6/message': {
        id: '3LMD6/message',
        name: 'message',
        type: 'NodeOutput',
        index: 1,
        nodeId: '3LMD6',
        valueType: 'Unknown',
      },
      'SpmQE/message': {
        id: 'SpmQE/message',
        name: 'message',
        type: 'NodeOutput',
        index: 0,
        nodeId: 'SpmQE',
        valueType: 'Unknown',
      },
      '3LMD6/messages_in': {
        id: '3LMD6/messages_in',
        name: 'messages',
        type: 'NodeInput',
        index: 0,
        nodeId: '3LMD6',
        valueType: 'Unknown',
      },
      'SpmQE/messages_in': {
        id: 'SpmQE/messages_in',
        name: 'messages',
        type: 'NodeInput',
        index: 0,
        nodeId: 'SpmQE',
        valueType: 'Unknown',
      },
      '3LMD6/messages_out': {
        id: '3LMD6/messages_out',
        name: 'messages',
        type: 'NodeOutput',
        index: 2,
        nodeId: '3LMD6',
        valueType: 'Unknown',
      },
      'SpmQE/messages_out': {
        id: 'SpmQE/messages_out',
        name: 'messages',
        type: 'NodeOutput',
        index: 1,
        nodeId: 'SpmQE',
        valueType: 'Unknown',
      },
    },
    nodeConfigsDict: {
      '3LMD6': {
        seed: null,
        stop: [],
        type: 'ChatGPTChatCompletionNode',
        model: 'gpt-4',
        nodeId: '3LMD6',
        temperature: 1,
        responseFormatType: null,
      },
      '7pl1l': { type: 'InputNode', nodeId: '7pl1l' },
      'SpmQE': {
        role: 'user',
        type: 'ChatGPTMessageNode',
        nodeId: 'SpmQE',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      'fXtmo': { type: 'OutputNode', nodeId: 'fXtmo' },
    },
    variableValueLookUpDicts: [
      {
        '7pl1l/vCths': 'the earth',
        'SpmQE/9n6vr': null,
        'fXtmo/awpiF': null,
        '3LMD6/content': null,
        '3LMD6/message': null,
        'SpmQE/message': null,
        '3LMD6/messages_in': null,
        'SpmQE/messages_in': null,
        '3LMD6/messages_out': null,
        'SpmQE/messages_out': null,
      },
    ],
  };
}
