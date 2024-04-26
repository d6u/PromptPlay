import { expect, test } from 'vitest';

import { CanvasDataV4Schema, safeParseAndApplyFix } from '../canvas-data-v4';

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
        kind: 'Start',
        type: 'InputNode',
        nodeId: 'GjREx',
        nodeName: 'input1',
      },
    },
  });

  expect(result).toHaveProperty('error');
  expect(result['error'].errors).toEqual([
    {
      code: 'custom',
      message: 'nodeConfig must have a corresponding node.',
      path: ['nodeConfigs', 'GjREx'],
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
      message: 'Connector must have a corresponding node.',
      path: ['connectors', 'GjREx/URLME'],
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

test('safeParseAndApplyFix should detect and fix nodeConfigs without nodes', () => {
  const result = safeParseAndApplyFix({
    nodeConfigs: {
      GjREx: {
        kind: 'Start',
        type: 'InputNode',
        nodeId: 'GjREx',
        nodeName: 'input1',
      },
    },
  });

  expect(result).toHaveProperty('originalErrors');
  expect(result['originalErrors']).toEqual([
    {
      code: 'custom',
      message: 'nodeConfig must have a corresponding node.',
      path: ['nodeConfigs', 'GjREx'],
    },
  ]);

  expect(result.success).toBe(true);
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

test('safeParseAndApplyFix should detect and fix connectors without nodes', () => {
  const result = safeParseAndApplyFix({
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

  expect(result).toHaveProperty('originalErrors');
  expect(result['originalErrors']).toEqual([
    {
      code: 'custom',
      message: 'Connector must have a corresponding node.',
      path: ['connectors', 'GjREx/URLME'],
    },
  ]);

  expect(result.success).toBe(true);
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

test('safeParseAndApplyFix should detect and fix orphan edge', () => {
  const result = safeParseAndApplyFix({
    edges: [
      {
        id: 'edge-1',
        target: 'node-1',
        source: 'node-2',
        targetHandle: 'connector-1',
        sourceHandle: 'connector-2',
      },
      {
        id: 'edge-1',
        target: 'node-1',
        source: 'node-2',
        targetHandle: 'connector-1',
        sourceHandle: 'connector-2',
      },
    ],
  });

  expect(result).toHaveProperty('originalErrors');
  expect(result['originalErrors']).toEqual([
    {
      code: 'custom',
      message:
        'Edge source, target, sourceHandle, and targetHandle must be valid node and connector IDs',
      path: ['edges', 0],
    },
    {
      code: 'custom',
      message:
        'Edge source, target, sourceHandle, and targetHandle must be valid node and connector IDs',
      path: ['edges', 1],
    },
  ]);

  expect(result.success).toBe(true);
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
