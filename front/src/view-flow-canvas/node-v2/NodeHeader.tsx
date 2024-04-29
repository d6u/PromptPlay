import styled from '@emotion/styled';

import {
  ConnectorType,
  NodeKind,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeAddConnectorButton from 'components/NodeAddConnectorButton';
import RemoveButton from 'generic-components/RemoveButton';
import IconThreeDots from 'icons/IconThreeDots';
import { useFlowStore } from 'state-flow/flow-store';

import { useCallback, useContext, useMemo } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import NodeBoxIconRename from 'view-flow-canvas/node-box/NodeBoxIconRename';
import { DRAG_HANDLE_CLASS_NAME } from '../constants';

type Props = {
  nodeId: string;
};

function NodeHeader(props: Props) {
  const updateNodeInternals = useUpdateNodeInternals();

  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const readonly = !isCurrentUserOwner;

  const nodeConfig = useFlowStore(
    (s) => s.getFlowContent().nodeConfigs[props.nodeId],
  );
  const removeNode = useFlowStore((s) => s.removeNode);
  const setCanvasRenameNodeId = useFlowStore((s) => s.setCanvasRenameNodeId);
  const addVariable = useFlowStore((s) => s.addConnector);

  const nodeDef = useMemo(
    () => getNodeDefinitionForNodeTypeName(nodeConfig.type),
    [nodeConfig],
  );

  const onAddVariable = useCallback(() => {
    addVariable(props.nodeId, ConnectorType.NodeInput, 0);
    updateNodeInternals(props.nodeId);
  }, [addVariable, props.nodeId, updateNodeInternals]);

  return (
    <Container>
      <TitleSection>
        <TitleContainer className={DRAG_HANDLE_CLASS_NAME}>
          <Title>{nodeDef.label}</Title>
          <DragHandle />
        </TitleContainer>
        {
          <SubTitleContainer className={DRAG_HANDLE_CLASS_NAME}>
            <SubTitle>{nodeDef.label}</SubTitle>
          </SubTitleContainer>
        }
        {!readonly && (
          <RemoveButtonContainer>
            <RemoveButton onClick={() => removeNode(props.nodeId)} />
          </RemoveButtonContainer>
        )}
      </TitleSection>
      <ActionsSection>
        {(nodeConfig.kind === NodeKind.Start ||
          nodeConfig.kind === NodeKind.SubroutineStart) && (
          <NodeBoxIconRename
            onClick={() => {
              setCanvasRenameNodeId(props.nodeId);
            }}
          />
        )}
        {!readonly && !!nodeDef.canUserAddIncomingVariables && (
          <NodeAddConnectorButton label="Variable" onClick={onAddVariable} />
        )}
      </ActionsSection>
    </Container>
  );
}

const Container = styled.div`
  margin-bottom: 5px;
`;

const TitleSection = styled.div`
  position: relative;
  margin-bottom: 5px;
`;

const TitleContainer = styled.div`
  cursor: grab;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
`;

const SubTitleContainer = styled.div`
  cursor: grab;
  padding-top: 5px;
  padding-left: 10px;
  padding-right: 10px;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 32px;
`;

const SubTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #636b74;
`;

const DragHandle = styled(IconThreeDots)`
  fill: #cacaca;
  width: 20px;
  position: absolute;
  top: -3px;
  left: calc(50% - 30px / 2);
`;

const RemoveButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const ActionsSection = styled.div`
  display: flex;
  gap: 5px;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
`;

export default NodeHeader;
