import styled from '@emotion/styled';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';

import { ConnectorID, NodeID } from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import NodeBoxIncomingVariableBlock from './NodeBoxIncomingVariableBlock';
import { DestConnector } from './ReactFlowNode';

type Props = {
  destConnectors: DestConnector[];
  onRowHeightChange?: (index: number, height: number) => void;
};

function NodeBoxIncomingVariablesSection(props: Props) {
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  return (
    <Container>
      {props.destConnectors.map((connector, i) => (
        <NodeBoxIncomingVariableBlock
          key={connector.id}
          name={connector.name}
          isReadOnly={connector.isReadOnly}
          helperMessage={connector.helperMessage}
          onConfirmNameChange={(name) => {
            if (!connector.isReadOnly) {
              updateVariable(connector.id as ConnectorID, { name });
            }
          }}
          onRemove={() => {
            if (!connector.isReadOnly) {
              removeVariable(connector.id as ConnectorID);
              updateNodeInternals(nodeId);
            }
          }}
          onHeightChange={(height: number) => {
            props.onRowHeightChange?.(i, height);
          }}
        />
      ))}
    </Container>
  );
}

const Container = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  margin-bottom: 10px;
`;

export default NodeBoxIncomingVariablesSection;
