import styled from '@emotion/styled';
import { Position } from 'reactflow';

import { useFlowStore } from 'state-flow/flow-store';

import { EdgeConnectStartConnectorClass } from 'state-flow/types';
import NodeConnectorResultDisplay from './NodeConnectorResultDisplay';
import { BaseVariableHandle } from './connector-handles';

type Props = {
  nodeId: string;
  variableId: string;
  variableName: string;
  variableValue: unknown;
};

function NodeVariableResultItem(props: Props) {
  const setCanvasLeftPaneIsOpen = useFlowStore(
    (s) => s.setCanvasLeftPaneIsOpen,
  );
  const setCanvasLeftPaneSelectedNodeId = useFlowStore(
    (s) => s.setCanvasLeftPaneSelectedNodeId,
  );

  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  let grayOutHandle = false;

  if (paramsOnUserStartConnectingEdge) {
    const { nodeId, handleId, handleType, connectorClass } =
      paramsOnUserStartConnectingEdge;

    const isThisTheStartHandle = handleId === props.variableId;
    const isThisOnTheSameNode = nodeId === props.nodeId;
    const isThisInTheSameConnectorClass =
      connectorClass === EdgeConnectStartConnectorClass.Variable;
    const isThisTheSameHandleType = handleType === 'source';

    grayOutHandle =
      !isThisTheStartHandle &&
      (isThisOnTheSameNode ||
        !isThisInTheSameConnectorClass ||
        isThisTheSameHandleType);
  }

  return (
    <Container>
      <NodeConnectorResultDisplay
        label={props.variableName}
        value={props.variableValue}
        onClick={() => {
          setCanvasLeftPaneIsOpen(true);
          setCanvasLeftPaneSelectedNodeId(props.nodeId);
        }}
      />
      <BaseVariableHandle
        type="source"
        position={Position.Right}
        id={props.variableId}
        style={{
          right: -19,
          background: grayOutHandle ? '#c2c2c2' : undefined,
          cursor: grayOutHandle ? 'not-allowed' : undefined,
        }}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

export default NodeVariableResultItem;
