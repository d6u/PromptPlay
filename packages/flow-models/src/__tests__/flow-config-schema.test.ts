import { expect, test } from 'vitest';

import { CanvasDataV4Schema } from '../canvas-data-v4';

test('FlowConfigSchema should provide default value for all root level fields', () => {
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
