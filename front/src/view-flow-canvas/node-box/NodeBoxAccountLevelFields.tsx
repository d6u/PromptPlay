import { useNodeId } from 'reactflow';

import {
  NodeAccountLevelTextFieldDefinition,
  NodeConfig,
  NodeID,
} from 'flow-models';

import NodeGlobalTextField from 'view-flow-canvas/node-fields/NodeGlobalTextField';

type Props = {
  isNodeConfigReadOnly: boolean;
  accountLevelConfigFieldDefinitions: Record<
    string,
    NodeAccountLevelTextFieldDefinition
  >;
  nodeConfig: NodeConfig;
};

function NodeBoxAccountLevelFields(props: Props) {
  const nodeId = useNodeId() as NodeID;

  return Object.entries(props.accountLevelConfigFieldDefinitions).map(
    ([fieldKey, fd]) => {
      return (
        <NodeGlobalTextField
          key={fieldKey}
          nodeId={nodeId}
          nodeType={props.nodeConfig.type}
          fieldKey={fieldKey}
          fieldDefinition={fd}
          isNodeConfigReadOnly={props.isNodeConfigReadOnly}
        />
      );
    },
  );
}

export default NodeBoxAccountLevelFields;
