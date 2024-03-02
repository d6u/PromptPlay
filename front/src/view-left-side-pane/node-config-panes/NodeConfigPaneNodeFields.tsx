import { useMemo } from 'react';

import { NodeConfig, getNodeDefinitionForNodeTypeName } from 'flow-models';

import NodeAccountLevelFields from 'components/node-fields/NodeAccountLevelFields';
import NodeBoxInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';

type Props = {
  nodeConfig: NodeConfig;
  isNodeConfigReadOnly: boolean;
};

function NodeConfigPaneNodeFields(props: Props) {
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  return (
    <div>
      {nodeDefinition.accountLevelConfigFieldDefinitions && (
        <NodeAccountLevelFields
          isNodeConfigReadOnly={props.isNodeConfigReadOnly}
          accountLevelConfigFieldDefinitions={
            nodeDefinition.accountLevelConfigFieldDefinitions
          }
          nodeConfig={props.nodeConfig}
        />
      )}
      <NodeBoxInstanceLevelFields
        isNodeConfigReadOnly={props.isNodeConfigReadOnly}
        instanceLevelConfigFieldDefinitions={
          nodeDefinition.instanceLevelConfigFieldDefinitions
        }
        nodeConfig={props.nodeConfig}
      />
    </div>
  );
}

export default NodeConfigPaneNodeFields;
