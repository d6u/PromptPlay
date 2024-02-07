import { Option } from '@mobily/ts-belt';

import { NodeType } from 'flow-models';

export type Edge = Readonly<{
  sourceNode: string;
  sourceConnector: string;
  targetNode: string;
  targetConnector: string;
}>;

export type GetAccountLevelFieldValueFunction = (
  nodeType: NodeType,
  fieldKey: string,
) => Option<string>;
