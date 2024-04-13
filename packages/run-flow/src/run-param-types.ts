import { Option } from '@mobily/ts-belt';

import { NodeTypeEnum } from 'flow-models';

export type Edge = Readonly<{
  sourceNode: string;
  sourceConnector: string;
  targetNode: string;
  targetConnector: string;
}>;

export type GetAccountLevelFieldValueFunction = (
  nodeType: NodeTypeEnum,
  fieldKey: string,
) => Option<string>;
