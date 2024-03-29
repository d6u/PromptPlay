import { expect, test } from 'vitest';

import { CanvasDataSchemaV3 } from '../canvas-data-v3';

test('FlowConfigSchema should provide default value for all root level fields', () => {
  const data = CanvasDataSchemaV3.parse({});

  expect(data).toEqual({
    edges: [],
    nodes: [],
    nodeConfigsDict: {},
    variablesDict: {},
    variableValueLookUpDicts: [{}],
    globalVariables: {},
  });
});

test('FlowConfigSchema should add condition target to node when needed', () => {
  const data = CanvasDataSchemaV3.parse({
    nodeConfigsDict: {
      yv1vr: {
        nodeId: 'yv1vr',
        type: 'TextTemplate',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
    },
  });

  expect(data).toEqual({
    edges: [],
    nodes: [],
    nodeConfigsDict: {
      yv1vr: {
        nodeId: 'yv1vr',
        type: 'TextTemplate',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
    },
    variablesDict: expect.anything(),
    variableValueLookUpDicts: [{}],
    globalVariables: {},
  });

  expect(Object.values(data.variablesDict)).toEqual([
    {
      type: 'ConditionTarget',
      id: expect.any(String),
      nodeId: 'yv1vr',
    },
  ]);
});

test('FlowConfigSchema should does not add condition target to when node already has one', () => {
  const data = CanvasDataSchemaV3.parse({
    nodeConfigsDict: {
      yv1vr: {
        nodeId: 'yv1vr',
        type: 'TextTemplate',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
    },
    variablesDict: {
      'yv1vr/123': {
        type: 'ConditionTarget',
        id: 'yv1vr/123',
        nodeId: 'yv1vr',
      },
    },
  });

  expect(data).toEqual({
    edges: [],
    nodes: [],
    nodeConfigsDict: {
      yv1vr: {
        nodeId: 'yv1vr',
        type: 'TextTemplate',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
    },
    variablesDict: {
      'yv1vr/123': {
        type: 'ConditionTarget',
        id: expect.any(String),
        nodeId: 'yv1vr',
      },
    },
    variableValueLookUpDicts: [{}],
    globalVariables: {},
  });
});
