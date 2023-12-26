import randomId from 'common-utils/randomId';
import NodeType from '../nodes/NodeType';
import { NodeID, V3VariableID } from './id-types';
import { ServerNode, VariableID } from './v3-flow-content-types';

export function createNode(type: NodeType, x: number, y: number): ServerNode {
  return {
    id: randomId() as NodeID,
    type,
    position: { x, y },
    data: null,
  };
}

export function asV3VariableID(id: VariableID | string): V3VariableID {
  return id as unknown as V3VariableID;
}
