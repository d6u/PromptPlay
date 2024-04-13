import { Option } from '@mobily/ts-belt';

import { NodeTypeEnum } from 'flow-models';

export type GetAccountLevelFieldValueFunction = (
  nodeType: NodeTypeEnum,
  fieldKey: string,
) => Option<string>;
