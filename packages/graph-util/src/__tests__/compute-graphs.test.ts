import { expect, test } from 'vitest';

import { GraphTraverseError, computeGraphs } from '../compute-graphs';

test('computeGraphs should compute root graph and loop graph', () => {
  const result = computeGraphs({
    edges: [
      {
        id: 'ARRdC',
        source: 'hElD9',
        sourceHandle: 'hElD9/mAd36',
        target: 'Pk4nQ',
        targetHandle: 'Pk4nQ/7PZhS',
      },
      {
        id: 'WtDm9',
        source: 'Pk4nQ',
        sourceHandle: 'Pk4nQ/jooB9',
        target: 'gHXou',
        targetHandle: 'gHXou/IgTHW',
      },
      {
        id: 'IKWau',
        source: '9Ui4x',
        sourceHandle: '9Ui4x/aNkK1',
        target: '8eLuD',
        targetHandle: '8eLuD/6HSC3',
      },
      {
        id: 'o8MVx',
        source: '8eLuD',
        sourceHandle: '8eLuD/st2vW',
        target: 'apgt9',
        targetHandle: 'apgt9/ViWA9',
      },
      {
        id: 'SVwnK',
        source: 'apgt9',
        sourceHandle: 'apgt9/hTTnq',
        target: '5w1jr',
        targetHandle: '5w1jr/gphwX',
      },
      {
        id: 'Dwc6R',
        source: 'apgt9',
        sourceHandle: 'apgt9/MPwJq',
        target: '5w1jr',
        targetHandle: '5w1jr/Sv19O',
      },
    ],
    nodeConfigs: {
      '5w1jr': {
        class: 'Finish',
        type: 'LoopFinish',
        nodeId: '5w1jr',
      },
      '8eLuD': {
        class: 'Process',
        type: 'JavaScriptFunctionNode',
        nodeId: '8eLuD',
        javaScriptCode: 'count = count ?? 0\ncount++\nreturn count',
      },
      '9Ui4x': {
        class: 'Start',
        type: 'LoopStart',
        nodeId: '9Ui4x',
        nodeName: 'loop5',
      },
      'Pk4nQ': {
        class: 'Process',
        type: 'Loop',
        nodeId: 'Pk4nQ',
        loopStartNodeId: '9Ui4x',
      },
      'apgt9': {
        class: 'Process',
        type: 'ConditionNode',
        nodeId: 'apgt9',
        stopAtTheFirstMatch: true,
      },
      'gHXou': {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'gHXou',
      },
      'hElD9': {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'hElD9',
        nodeName: 'input',
      },
    },
    startNodeIds: ['hElD9'],
  });

  expect(result).toEqual({
    graphRecords: {
      'ROOT': {
        hElD9: {},
        Pk4nQ: { 'Pk4nQ/7PZhS': { 'hElD9/mAd36': false } },
        gHXou: { 'gHXou/IgTHW': { 'Pk4nQ/jooB9': false } },
      },
      '9Ui4x': {
        '9Ui4x': {},
        '8eLuD': { '8eLuD/6HSC3': { '9Ui4x/aNkK1': false } },
        'apgt9': { 'apgt9/ViWA9': { '8eLuD/st2vW': false } },
        '5w1jr': {
          '5w1jr/gphwX': { 'apgt9/hTTnq': false },
          '5w1jr/Sv19O': { 'apgt9/MPwJq': false },
        },
      },
    },
    errors: {},
  });
});

test('computeGraphs should flag circles in the root graph and stop early', () => {
  const result = computeGraphs({
    edges: [
      {
        id: '0GbQR',
        source: '0RoeE',
        sourceHandle: '0RoeE/egSVT',
        target: 'gO0Yw',
        targetHandle: 'gO0Yw/zRJfD',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'mVSZj',
        source: 'BYC8P',
        sourceHandle: 'BYC8P/ldeeQ',
        target: '0RoeE',
        targetHandle: '0RoeE/vnuub',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'UydHT',
        source: 'gO0Yw',
        sourceHandle: 'gO0Yw/oYEr0',
        target: 'BYC8P',
        targetHandle: 'BYC8P/894DO',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    nodeConfigs: {
      '0RoeE': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: '0RoeE',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      'BYC8P': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'BYC8P',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      'gO0Yw': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'gO0Yw',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
    },
    startNodeIds: [],
  });

  expect(result).toEqual({
    graphRecords: {},
    errors: {
      ROOT: [GraphTraverseError.Circle],
    },
  });
});

test('computeGraphs should flag circles in the root graph but still finish compute graph', () => {
  const result = computeGraphs({
    edges: [
      {
        id: '0GbQR',
        source: '0RoeE',
        sourceHandle: '0RoeE/egSVT',
        target: 'gO0Yw',
        targetHandle: 'gO0Yw/zRJfD',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'mVSZj',
        source: 'BYC8P',
        sourceHandle: 'BYC8P/ldeeQ',
        target: '0RoeE',
        targetHandle: '0RoeE/vnuub',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'UydHT',
        source: 'gO0Yw',
        sourceHandle: 'gO0Yw/oYEr0',
        target: 'BYC8P',
        targetHandle: 'BYC8P/894DO',
        style: {
          strokeWidth: 2,
        },
      },
      {
        source: '87KV6',
        sourceHandle: '87KV6/9oUaG',
        target: 'BYC8P',
        targetHandle: 'BYC8P/XZ6ng',
        id: 'teTQ1',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    nodeConfigs: {
      '0RoeE': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: '0RoeE',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      'BYC8P': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'BYC8P',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      'gO0Yw': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'gO0Yw',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      '87KV6': {
        class: 'Start',
        nodeId: '87KV6',
        type: 'InputNode',
        nodeName: 'input',
      },
    },
    startNodeIds: ['87KV6'],
  });

  expect(result).toEqual({
    graphRecords: {
      ROOT: {
        '0RoeE': {
          '0RoeE/vnuub': {
            'BYC8P/ldeeQ': false,
          },
        },
        '87KV6': {},
        'BYC8P': {
          'BYC8P/894DO': {
            'gO0Yw/oYEr0': false,
          },
          'BYC8P/XZ6ng': {
            '87KV6/9oUaG': false,
          },
        },
        'gO0Yw': {
          'gO0Yw/zRJfD': {
            '0RoeE/egSVT': false,
          },
        },
      },
    },
    errors: {
      BYC8P: [GraphTraverseError.Circle],
    },
  });
});

test('computeGraphs should flag circles in the loop graph', () => {
  const result = computeGraphs({
    edges: [
      {
        id: 'sEPX3',
        source: 'C5qj4',
        sourceHandle: 'C5qj4/8SbeZ',
        target: 'd73d5',
        targetHandle: 'd73d5/2tPoN',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'eVmKD',
        source: 'x8dFG',
        sourceHandle: 'x8dFG/70e5U',
        target: 'OnocH',
        targetHandle: 'OnocH/BFJXb',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'lmI3a',
        source: 'OnocH',
        sourceHandle: 'OnocH/I1B7W',
        target: '5FOll',
        targetHandle: '5FOll/uZ8GJ',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'pRtKX',
        source: 'd73d5',
        sourceHandle: 'd73d5/EM7Mv',
        target: 'f31kS',
        targetHandle: 'f31kS/Fa8td',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: '1nA3z',
        source: 'f31kS',
        sourceHandle: 'f31kS/Yftqo',
        target: 'd73d5',
        targetHandle: 'd73d5/2tPoN',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    nodeConfigs: {
      '5FOll': {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: '5FOll',
      },
      'C5qj4': {
        class: 'Start',
        type: 'LoopStart',
        nodeId: 'C5qj4',
        nodeName: 'loop start 1',
      },
      'OnocH': {
        class: 'Process',
        type: 'Loop',
        nodeId: 'OnocH',
        loopStartNodeId: 'C5qj4',
      },
      'd73d5': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'd73d5',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      'f31kS': {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'f31kS',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      'x8dFG': {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'x8dFG',
        nodeName: 'input',
      },
    },
    startNodeIds: ['x8dFG'],
  });

  expect(result).toEqual({
    graphRecords: {
      C5qj4: {
        C5qj4: {},
        d73d5: {
          'd73d5/2tPoN': {
            'C5qj4/8SbeZ': false,
            'f31kS/Yftqo': false,
          },
        },
        f31kS: {
          'f31kS/Fa8td': {
            'd73d5/EM7Mv': false,
          },
        },
      },
      ROOT: {
        '5FOll': {
          '5FOll/uZ8GJ': {
            'OnocH/I1B7W': false,
          },
        },
        'OnocH': {
          'OnocH/BFJXb': {
            'x8dFG/70e5U': false,
          },
        },
        'x8dFG': {},
      },
    },
    errors: {
      d73d5: [GraphTraverseError.Circle],
    },
  });
});

// NOTE: See comment for `GraphTraverseError` for case 1
test('computeGraphs should detect overlap between graphs for case 1', () => {
  const result = computeGraphs({
    edges: [
      {
        id: 'PHucf',
        source: 'rKRda',
        sourceHandle: 'rKRda/Ip2k0',
        target: 'SY4EY',
        targetHandle: 'SY4EY/XmY8K',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'yMcTX',
        source: 'SY4EY',
        sourceHandle: 'SY4EY/exwvZ',
        target: 'pXGfl',
        targetHandle: 'pXGfl/mfHF5',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'mLcXg',
        source: 'rKRda',
        sourceHandle: 'rKRda/Ip2k0',
        target: 'NLawE',
        targetHandle: 'NLawE/7rcAw',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'QdPrC',
        source: 'olxrR',
        sourceHandle: 'olxrR/pAMWI',
        target: 'NLawE',
        targetHandle: 'NLawE/7rcAw',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'TrIBk',
        source: 'olxrR',
        sourceHandle: 'olxrR/pAMWI',
        target: 'iIuVy',
        targetHandle: 'iIuVy/cakpA',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    nodeConfigs: {
      NLawE: {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'NLawE',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      SY4EY: {
        class: 'Process',
        type: 'Loop',
        nodeId: 'SY4EY',
        loopStartNodeId: 'olxrR',
      },
      iIuVy: {
        class: 'Finish',
        type: 'LoopFinish',
        nodeId: 'iIuVy',
      },
      olxrR: {
        class: 'Start',
        type: 'LoopStart',
        nodeId: 'olxrR',
        nodeName: 'loop start 1',
      },
      pXGfl: {
        class: 'Finish',
        type: 'OutputNode',
        nodeId: 'pXGfl',
      },
      rKRda: {
        class: 'Start',
        type: 'InputNode',
        nodeId: 'rKRda',
        nodeName: 'input',
      },
    },
    startNodeIds: ['rKRda'],
  });

  expect(result).toEqual({
    graphRecords: {
      ROOT: {
        NLawE: {
          'NLawE/7rcAw': {
            'olxrR/pAMWI': false,
            'rKRda/Ip2k0': false,
          },
        },
        SY4EY: {
          'SY4EY/XmY8K': {
            'rKRda/Ip2k0': false,
          },
        },
        pXGfl: {
          'pXGfl/mfHF5': {
            'SY4EY/exwvZ': false,
          },
        },
        rKRda: {},
      },
      olxrR: {
        NLawE: {
          'NLawE/7rcAw': {
            'olxrR/pAMWI': false,
            'rKRda/Ip2k0': false,
          },
        },
        iIuVy: {
          'iIuVy/cakpA': {
            'olxrR/pAMWI': false,
          },
        },
        olxrR: {},
      },
    },
    errors: {
      NLawE: ['Overlap'],
    },
  });
});

// NOTE: See comment for `GraphTraverseError` for case 2
test('computeGraphs should detect overlap between graphs for case 2', () => {
  const result = computeGraphs({
    edges: [
      {
        id: 'LIdmc',
        source: 'yTknh',
        sourceHandle: 'yTknh/Xfa00',
        target: 'IB2pR',
        targetHandle: 'IB2pR/TjW8f',
        style: {
          strokeWidth: 2,
        },
      },
      {
        id: 'WU0go',
        source: 'VVxeo',
        sourceHandle: 'VVxeo/istNC',
        target: 'IB2pR',
        targetHandle: 'IB2pR/xhXvl',
        style: {
          strokeWidth: 2,
        },
      },
    ],
    nodeConfigs: {
      IB2pR: {
        class: 'Finish',
        type: 'LoopFinish',
        nodeId: 'IB2pR',
      },
      VVxeo: {
        class: 'Process',
        type: 'TextTemplate',
        nodeId: 'VVxeo',
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      yTknh: {
        class: 'Start',
        type: 'LoopStart',
        nodeId: 'yTknh',
        nodeName: 'loop start 1',
      },
    },
    startNodeIds: [],
  });

  expect(result).toEqual({
    errors: {
      IB2pR: ['Overlap'],
    },
    graphRecords: {
      ROOT: {
        IB2pR: {
          'IB2pR/TjW8f': {
            'yTknh/Xfa00': false,
          },
          'IB2pR/xhXvl': {
            'VVxeo/istNC': false,
          },
        },
        VVxeo: {},
      },
      yTknh: {
        IB2pR: {
          'IB2pR/TjW8f': {
            'yTknh/Xfa00': false,
          },
          'IB2pR/xhXvl': {
            'VVxeo/istNC': false,
          },
        },
        yTknh: {},
      },
    },
  });
});
