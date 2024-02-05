import IconButton from '@mui/joy/IconButton';
import {
  ConnectorType,
  InputNodeInstanceLevelConfig,
  NodeID,
  NodeType,
} from 'flow-models';
import { useContext, useMemo } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { DetailPanelContentType } from 'state-flow/types';
import { selectVariables } from 'state-flow/util/state-utils';
import OutgoingVariableHandle from '../handles/OutgoingVariableHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxAddConnectorButton from '../node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxIconGear from '../node-box/NodeBoxIconGear';
import NodeBoxIncomingVariableSection from '../node-box/NodeBoxIncomingVariableSection';
import NodeBoxOutgoingConnectorBlock from '../node-box/NodeBoxOutgoingConnectorBlock';
import NodeBoxSmallSection from '../node-box/NodeBoxSmallSection';

export default function InputNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // SECTION: Select state from store

  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addVariable = useFlowStore((s) => s.addVariable);
  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  // !SECTION

  const flowInputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.FlowInput, variablesDict);
  }, [nodeId, variablesDict]);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as InputNodeInstanceLevelConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

  const updateNodeInternals = useUpdateNodeInternals();

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      <NodeBox nodeType={NodeType.InputNode}>
        <NodeBoxHeaderSection
          isReadOnly={isCurrentUserOwner}
          title="Input"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        <NodeBoxSmallSection>
          <IconButton
            variant="outlined"
            onClick={() =>
              setDetailPanelContentType(
                DetailPanelContentType.EvaluationModeSimple,
              )
            }
          >
            <NodeBoxIconGear />
          </IconButton>
          {isCurrentUserOwner && (
            <NodeBoxAddConnectorButton
              label="Variable"
              onClick={() => {
                addVariable(nodeId, ConnectorType.FlowInput, flowInputs.length);
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </NodeBoxSmallSection>
        <NodeBoxIncomingVariableSection>
          {flowInputs.map((flowInput, i) => (
            <NodeBoxOutgoingConnectorBlock
              key={flowInput.id}
              name={flowInput.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                updateVariable(flowInput.id, { name });
              }}
              onRemove={() => {
                removeVariable(flowInput.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </NodeBoxIncomingVariableSection>
      </NodeBox>
      {flowInputs.map((flowInput, i) => (
        <OutgoingVariableHandle
          key={flowInput.id}
          id={flowInput.id}
          index={i}
          totalVariableCount={flowInputs.length}
        />
      ))}
    </>
  );
}
