import styled from '@emotion/styled';
import { useReactFlow, useStoreApi } from 'reactflow';

import { NodeKind, type NodeKindEnum } from 'flow-models';

import NodeAddConnectorButton from 'components/NodeAddConnectorButton';
import RemoveButton from 'generic-components/RemoveButton';
import IconThreeDots from 'icons/IconThreeDots';
import { useFlowStore } from 'state-flow/flow-store';

import { DRAG_HANDLE_CLASS_NAME } from '../constants';
import NodeBoxGearButton from './NodeBoxIconGear';
import NodeBoxIconRename from './NodeBoxIconRename';

type Props = {
  // Static values
  title: string;
  subTitle?: string;
  // Node Level
  nodeKind: NodeKindEnum;
  nodeId: string;
  isNodeReadOnly: boolean;
} & (
  | { showAddVariableButton: false }
  | {
      showAddVariableButton: true;
      onClickAddVariableButton: () => void;
    }
);

function NodeBoxHeaderSection(props: Props) {
  const removeNode = useFlowStore((s) => s.removeNode);
  const openInspectorForNode = useFlowStore(
    (s) => s.openCanvasLeftPaneInspectorForNode,
  );
  const setCanvasRenameNodeId = useFlowStore((s) => s.setCanvasRenameNodeId);

  const reactflow = useReactFlow();
  const reactflowStoreApi = useStoreApi();

  return (
    <Container>
      <TitleSection>
        <TitleContainer className={DRAG_HANDLE_CLASS_NAME}>
          <Title>{props.title}</Title>
          <DragHandle />
        </TitleContainer>
        {props.subTitle && (
          <SubTitleContainer className={DRAG_HANDLE_CLASS_NAME}>
            <SubTitle>{props.subTitle}</SubTitle>
          </SubTitleContainer>
        )}
        {!props.isNodeReadOnly && (
          <RemoveButtonContainer>
            <RemoveButton onClick={() => removeNode(props.nodeId)} />
          </RemoveButtonContainer>
        )}
      </TitleSection>
      <ActionsSection>
        {(props.nodeKind === NodeKind.Start ||
          props.nodeKind === NodeKind.SubroutineStart) && (
          <NodeBoxIconRename
            onClick={() => {
              setCanvasRenameNodeId(props.nodeId);
            }}
          />
        )}
        <NodeBoxGearButton
          onClick={() => {
            openInspectorForNode(
              props.nodeId,
              reactflowStoreApi.getState(),
              reactflow,
            );
          }}
        />
        {!props.isNodeReadOnly &&
          props.showAddVariableButton &&
          props.onClickAddVariableButton && (
            <NodeAddConnectorButton
              label="Variable"
              onClick={props.onClickAddVariableButton}
            />
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

export default NodeBoxHeaderSection;
