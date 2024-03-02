import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { Control, FieldArrayWithId } from 'react-hook-form';
import { Position } from 'reactflow';

import { useFlowStore } from 'state-flow/flow-store';
import { EdgeConnectStartConnectorClass } from 'state-flow/types';
import DragHandle from './DragHandle';
import NodeConditionEditor from './NodeConditionEditor';
import NodeConnectorResultDisplay from './NodeConnectorResultDisplay';
import { BaseConditionHandle, HANDLE_HEIGHT } from './base-connector-handles';
import { ConditionConfig, ConditionFormValue } from './types';

type Props = {
  // Won't change within current session
  isListSortable: boolean;
  showHandle: boolean;
  // Node level
  nodeId: string;
  isNodeReadOnly: boolean;
  // Connector level
  index: number;
  condition: ConditionConfig;
  // react-hook-form
  control: Control<ConditionFormValue>;
  formField: FieldArrayWithId<ConditionFormValue, 'list', 'id'>;
  // Callbacks
  onRemove: () => void;
  onUpdateTrigger: () => void;
  onClickResult?: () => void;
};

function NodeConditionEditableItem(props: Props) {
  const isSortableEnabledForThisRow =
    !props.isNodeReadOnly &&
    !props.condition.isReadOnly &&
    props.isListSortable;

  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  let grayOutHandle = false;

  if (paramsOnUserStartConnectingEdge) {
    const { nodeId, handleId, handleType, connectorClass } =
      paramsOnUserStartConnectingEdge;

    const isThisTheStartHandle = handleId === props.condition.id;
    const isThisOnTheSameNode = nodeId === props.nodeId;
    const isThisInTheSameConnectorClass =
      connectorClass === EdgeConnectStartConnectorClass.Condition;
    const isThisTheSameHandleType = handleType === 'source';

    grayOutHandle =
      !isThisTheStartHandle &&
      (isThisOnTheSameNode ||
        !isThisInTheSameConnectorClass ||
        isThisTheSameHandleType);
  }

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.formField.id,
      disabled: !isSortableEnabledForThisRow,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Container>
      {props.showHandle && (
        <BaseConditionHandle
          id={props.condition.id}
          type="source"
          position={Position.Right}
          style={{
            top: HANDLE_HEIGHT / 2,
            right: -19,
            background: grayOutHandle ? '#c2c2c2' : undefined,
            cursor: grayOutHandle ? 'not-allowed' : undefined,
          }}
        />
      )}
      <ContentContainer ref={setNodeRef} style={style} {...attributes}>
        {isSortableEnabledForThisRow && <DragHandle {...listeners} />}
        <EditorContainer>
          <EditorRow>
            <NodeConditionEditor
              isReadOnly={props.isNodeReadOnly || props.condition.isReadOnly}
              control={props.control}
              formField={props.formField}
              index={props.index}
              onRemove={props.onRemove}
              onUpdateTrigger={props.onUpdateTrigger}
            />
          </EditorRow>
          <StyledNodeConnectorResultDisplay
            label="is matched"
            value={props.condition.isMatched}
            onClick={props.onClickResult}
          />
        </EditorContainer>
      </ContentContainer>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const EditorContainer = styled.div`
  flex-grow: 1;
`;

const EditorRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

const StyledNodeConnectorResultDisplay = styled(NodeConnectorResultDisplay)`
  margin-bottom: 0;
  cursor: initial;
`;

export default NodeConditionEditableItem;
