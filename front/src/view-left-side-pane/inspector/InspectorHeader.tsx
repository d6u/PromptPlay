import HeaderSectionHeader from 'components/side-pane/SidePaneHeaderSectionHeader';
import { getNodeDefinitionForNodeTypeName } from 'flow-models';
import { useMemo } from 'react';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  nodeId: string;
};

function InspectorHeader(props: Props) {
  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );

  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(nodeConfig.type),
    [nodeConfig.type],
  );

  return <HeaderSectionHeader>{nodeDefinition.label}</HeaderSectionHeader>;
}

export default InspectorHeader;
