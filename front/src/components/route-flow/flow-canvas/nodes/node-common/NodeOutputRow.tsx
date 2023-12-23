import styled from '@emotion/styled';
import { NodeID } from 'flow-models';
import { useNodeId } from 'reactflow';
import { useStore } from 'zustand';
import { useStoreFromFlowStoreContext } from '../../../store/FlowStoreContext';
import { DetailPanelContentType } from '../../../store/store-flow-state-types';
import { ROW_MARGIN_TOP } from './NodeInputModifyRow';

type Props = {
  id: string;
  name: string;
  value: unknown;
  onClick?: () => void;
};

export default function NodeOutputRow(props: Props) {
  const flowStore = useStoreFromFlowStoreContext();

  const setDetailPanelContentType = useStore(
    flowStore,
    (s) => s.setDetailPanelContentType,
  );
  const setDetailPanelSelectedNodeId = useStore(
    flowStore,
    (s) => s.setDetailPanelSelectedNodeId,
  );

  const nodeId = useNodeId() as NodeID;

  return (
    <Container>
      <Content
        onClick={
          props.onClick ??
          (() => {
            setDetailPanelContentType(DetailPanelContentType.NodeConfig);
            setDetailPanelSelectedNodeId(nodeId);
          })
        }
      >
        <Name>{props.name} =&nbsp;</Name>
        <Value>{JSON.stringify(props.value)}</Value>
      </Content>
    </Container>
  );
}

// SECTION: UI Components

export const VARIABLE_LABEL_HEIGHT = 32;

const Container = styled.div`
  margin-bottom: ${ROW_MARGIN_TOP}px;
  display: flex;
  gap: 5px;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Content = styled.div`
  height: ${VARIABLE_LABEL_HEIGHT}px;
  padding: 0 10px;
  border: 1px solid blue;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  min-width: 0;
  flex-grow: 1;
  cursor: pointer;
  font-size: 14px;
`;

const Name = styled.code`
  white-space: nowrap;
`;

const Value = styled.code`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

// !SECTION
