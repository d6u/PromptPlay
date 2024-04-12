import { expect, test } from 'vitest';

import { CanvasDataV4Schema } from '../canvas-data-v4';

test('CanvasDataV4Schema should provide default value for all root level fields', () => {
  const result = CanvasDataV4Schema.safeParse({});

  expect(result).toHaveProperty('data', {
    edges: [],
    nodes: [],
    nodeConfigs: {},
    connectors: {},
    globalVariables: {},
    conditionResults: {},
    variableResults: {},
  });
});

test('CanvasDataV4Schema should detect nodes without nodeConfigs', () => {
  const result = CanvasDataV4Schema.safeParse({
    nodes: [
      {
        id: 'node-1',
        type: '',
        position: { x: 0, y: 0 },
      },
    ],
  });

  expect(result).toHaveProperty('error');
  expect(result['error'].errors).toEqual([
    {
      code: 'custom',
      message: 'There are nodes without nodeConfigs.',
      path: ['nodeConfigs'],
    },
  ]);
});

test('CanvasDataV4Schema should detect nodeConfigs without nodes', () => {
  const result = CanvasDataV4Schema.safeParse({
    nodeConfigs: {
      GjREx: {
        type: 'InputNode',
        nodeId: 'GjREx',
        class: 'Start',
        nodeName: 'input1',
      },
    },
  });

  expect(result).toHaveProperty('error');
  expect(result['error'].errors).toEqual([
    {
      code: 'custom',
      message: 'There are nodeConfigs without nodes.',
      path: ['nodeConfigs'],
    },
  ]);
});

test('CanvasDataV4Schema should detect connectors without nodes', () => {
  const result = CanvasDataV4Schema.safeParse({
    connectors: {
      'GjREx/URLME': {
        type: 'NodeOutput',
        id: 'GjREx/URLME',
        name: 'input',
        nodeId: 'GjREx',
        index: 0,
        valueType: 'String',
        isGlobal: false,
        globalVariableId: null,
      },
    },
  });

  expect(result).toHaveProperty('error');
  expect(result['error'].errors).toEqual([
    {
      code: 'custom',
      message: 'There are connectors without nodes.',
      path: ['connectors'],
    },
  ]);
});

test('CanvasDataV4Schema should detect orphan edge', () => {
  const result = CanvasDataV4Schema.safeParse({
    edges: [
      {
        id: 'edge-1',
        target: 'node-1',
        source: 'node-2',
        targetHandle: 'connector-1',
        sourceHandle: 'connector-2',
      },
    ],
  });

  expect(result).toHaveProperty('error');
  expect(result['error'].errors).toEqual([
    {
      code: 'custom',
      message:
        'Edge source, target, sourceHandle, and targetHandle must be valid node and connector IDs',
      path: ['edges', 0],
    },
  ]);
});
