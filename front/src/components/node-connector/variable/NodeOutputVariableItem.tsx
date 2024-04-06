import styled from '@emotion/styled';
import { Position } from 'reactflow';

import { EdgeConnectStartConnectorClass } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

import { Control, FieldArrayWithId, useController } from 'react-hook-form';
import { BaseVariableHandle } from '../base-connector-handles';
import NodeConnectorResultDisplay from '../condition/NodeConnectorResultDisplay';
import { NodeOutputVariablePropsArrayFieldValues } from '../types';
import NodeVariableGlobalVariableSelectorRow, {
  VariableGlobalVariableIdArrayFieldValues,
} from './NodeVariableGlobalVariableConfigRow';
import NodeVariableToggleIsGlobalButton from './NodeVariableToggleIsGlobalButton';

type Props = {
  // Node level
  nodeId: string;
  isNodeReadOnly: boolean;
  // Variable level
  variableId: string;
  // react-hook-form
  control: Control<NodeOutputVariablePropsArrayFieldValues>;
  formField: FieldArrayWithId<NodeOutputVariablePropsArrayFieldValues, 'list'>;
  index: number;
  // Callbacks
  onUpdateTrigger: () => void;
};

function NodeOutputVariableItem(props: Props) {
  const setCanvasLeftPaneIsOpen = useFlowStore(
    (s) => s.setCanvasLeftPaneIsOpen,
  );
  const setCanvasLeftPaneSelectedNodeId = useFlowStore(
    (s) => s.setCanvasLeftPaneSelectedNodeId,
  );

  const paramsOnUserStartConnectingEdge = useFlowStore(
    (s) => s.paramsOnUserStartConnectingEdge,
  );

  const { field: formFieldIsGlobal } = useController({
    name: `list.${props.index}.isGlobal`,
    control: props.control,
  });

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
      <RowA>
        <NodeConnectorResultDisplay
          label={props.formField.name}
          value={props.formField.value}
          onClick={() => {
            setCanvasLeftPaneIsOpen(true);
            setCanvasLeftPaneSelectedNodeId(props.nodeId);
          }}
        />
        <NodeVariableToggleIsGlobalButton
          disabled={false}
          isActive={formFieldIsGlobal.value}
          onClick={() => {
            formFieldIsGlobal.onChange(!formFieldIsGlobal.value);
            props.onUpdateTrigger();
          }}
        />
      </RowA>
      {formFieldIsGlobal.value && (
        <NodeVariableGlobalVariableSelectorRow
          isNodeReadOnly={props.isNodeReadOnly}
          variableId={props.variableId}
          control={
            // TODO: Until react-hook-form handles generic type better:
            // https://github.com/react-hook-form/react-hook-form/issues/11617
            props.control as unknown as Control<VariableGlobalVariableIdArrayFieldValues>
          }
          formField={props.formField}
          index={props.index}
          onUpdateTrigger={props.onUpdateTrigger}
        />
      )}
      {!formFieldIsGlobal.value && (
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
      )}
    </Container>
  );
}

const Container = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  position: relative;
`;

const RowA = styled.div`
  display: flex;
  gap: 5px;
`;

export default NodeOutputVariableItem;
