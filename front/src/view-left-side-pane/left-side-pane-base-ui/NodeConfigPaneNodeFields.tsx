import { useContext, useMemo } from 'react';

import { getNodeDefinitionForNodeTypeName } from 'flow-models';

import NodeBoxInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  nodeId: string;
};

function NodeConfigPaneNodeFields(props: Props) {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const isReadOnly = !isCurrentUserOwner;

  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(nodeConfig.type),
    [nodeConfig.type],
  );

  return (
    <div>
      <NodeBoxInstanceLevelFields
        isNodeConfigReadOnly={isReadOnly}
        nodeConfigFieldDefs={nodeDefinition.configFields}
        nodeConfig={nodeConfig}
        isNodeInspectorPane
      />
    </div>
  );
}

export default NodeConfigPaneNodeFields;
