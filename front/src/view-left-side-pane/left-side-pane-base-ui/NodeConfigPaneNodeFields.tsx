import { useMemo } from 'react';

import { NodeConfig, getNodeDefinitionForNodeTypeName } from 'flow-models';

import NodeBoxInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';

type Props = {
  nodeConfig: NodeConfig;
  isNodeReadOnly: boolean;
};

function NodeConfigPaneNodeFields(props: Props) {
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  return (
    <div>
      <NodeBoxInstanceLevelFields
        isNodeConfigReadOnly={props.isNodeReadOnly}
        nodeConfigFieldDefs={nodeDefinition.configFields}
        nodeConfig={props.nodeConfig}
        isNodeInspectorPane
      />
    </div>
  );
}

export default NodeConfigPaneNodeFields;
