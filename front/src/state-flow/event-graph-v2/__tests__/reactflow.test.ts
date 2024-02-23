import { produce } from 'immer';
import { Edge, addEdge } from 'reactflow';
import { expect, test } from 'vitest';

test('addEdge should not mutate edges array', () => {
  const edges: Edge[] = [
    {
      source: 'ZUhTs',
      sourceHandle: 'ZUhTs/aPZ3h',
      target: 'Is8Op',
      targetHandle: 'Is8Op/5TUFT',
      id: 'lfx3a',
      style: {
        strokeWidth: 2,
      },
    },
  ];

  const sameEdges = produce(edges, (draft) => {
    addEdge(
      {
        source: 'WHqYI',
        sourceHandle: 'WHqYI/p8a32',
        target: 'Is8Op',
        targetHandle: 'Is8Op/5TUFT',
      },
      draft,
    );
  });

  // NOTE: The usage of reference equality check
  expect(sameEdges).toBe(edges);
});

test('addEdge should replace edge', () => {
  const edges: Edge[] = [
    {
      source: 'ZUhTs',
      sourceHandle: 'ZUhTs/aPZ3h',
      target: 'Is8Op',
      targetHandle: 'Is8Op/5TUFT',
      id: 'lfx3a',
      style: {
        strokeWidth: 2,
      },
    },
  ];

  const newEdges = addEdge(
    {
      source: 'WHqYI',
      sourceHandle: 'WHqYI/p8a32',
      target: 'Is8Op',
      targetHandle: 'Is8Op/5TUFT',
    },
    edges,
  );

  expect(newEdges).toEqual([
    {
      source: 'ZUhTs',
      sourceHandle: 'ZUhTs/aPZ3h',
      target: 'Is8Op',
      targetHandle: 'Is8Op/5TUFT',
      id: 'lfx3a',
      style: {
        strokeWidth: 2,
      },
    },
    {
      id: expect.any(String),
      source: 'WHqYI',
      sourceHandle: 'WHqYI/p8a32',
      target: 'Is8Op',
      targetHandle: 'Is8Op/5TUFT',
    },
  ]);
});

test('addEdge should ignore existing connection and not mutate edges array', () => {
  const edges: Edge[] = [
    {
      source: 'ZUhTs',
      sourceHandle: 'ZUhTs/aPZ3h',
      target: 'Is8Op',
      targetHandle: 'Is8Op/5TUFT',
      id: 'lfx3a',
      style: {
        strokeWidth: 2,
      },
    },
  ];

  const newEdges = addEdge(
    {
      source: 'ZUhTs',
      sourceHandle: 'ZUhTs/aPZ3h',
      target: 'Is8Op',
      targetHandle: 'Is8Op/5TUFT',
    },
    edges,
  );

  // NOTE: The usage of reference equality check
  expect(newEdges).toBe(edges);
});
