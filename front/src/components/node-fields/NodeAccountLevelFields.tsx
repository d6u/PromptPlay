import { NodeAccountLevelTextFieldDefinition, NodeConfig } from 'flow-models';

import NodeGlobalTextField from 'components/node-fields/NodeGlobalTextField';

type Props = {
  isNodeConfigReadOnly: boolean;
  accountLevelConfigFieldDefinitions: Record<
    string,
    NodeAccountLevelTextFieldDefinition
  >;
  nodeConfig: NodeConfig;
};

function NodeAccountLevelFields(props: Props) {
  return Object.entries(props.accountLevelConfigFieldDefinitions).map(
    ([fieldKey, fd]) => {
      return (
        <NodeGlobalTextField
          key={fieldKey}
          nodeId={props.nodeConfig.nodeId}
          nodeType={props.nodeConfig.type}
          fieldKey={fieldKey}
          fieldDefinition={fd}
          isNodeConfigReadOnly={props.isNodeConfigReadOnly}
        />
      );
    },
  );
}

export default NodeAccountLevelFields;
