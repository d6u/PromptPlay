import Chance from 'chance';
import { V3NodeConfig } from '.';
import { LocalNode, Variable } from '../v3-flow-content-types';

export type CreateDefaultNodeConfigFunction = (node: LocalNode) => {
  nodeConfig: V3NodeConfig;
  variableConfigList: Variable[];
};

export const chance = new Chance();
