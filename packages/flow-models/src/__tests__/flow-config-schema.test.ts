import { expect, test } from 'vitest';

import { CanvasDataSchemaV4 } from '../canvas-data-v4';

test('FlowConfigSchema should provide default value for all root level fields', () => {
  const result = CanvasDataSchemaV4.safeParse({});

  expect(result).toHaveProperty('data', {
    edges: [],
    nodes: [],
    nodeConfigsDict: {},
    variablesDict: {},
    variableValueLookUpDicts: [{}],
    globalVariables: {},
  });
});
