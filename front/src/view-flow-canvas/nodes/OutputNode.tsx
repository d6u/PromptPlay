import { A } from '@mobily/ts-belt';
import IconButton from '@mui/joy/IconButton';
import {
  ConnectorType,
  NodeID,
  NodeType,
  V3OutputNodeConfig,
} from 'flow-models';
import { useContext, useMemo } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { DetailPanelContentType } from 'state-flow/types';
import { selectVariables } from 'state-flow/util/state-utils';
import IncomingVariableHandle from '../handles/IncomingVariableHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxAddConnectorButton from '../node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxIconGear from '../node-box/NodeBoxIconGear';
import NodeBoxIncomingVariableBlock, {
  ROW_MARGIN_TOP,
} from '../node-box/NodeBoxIncomingVariableBlock';
import NodeBoxIncomingVariableSection from '../node-box/NodeBoxIncomingVariableSection';
import { VARIABLE_LABEL_HEIGHT } from '../node-box/NodeBoxOutgoingVariableBlock';
import NodeBoxSmallSection from '../node-box/NodeBoxSmallSection';

export default function OutputNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addVariable = useFlowStore((s) => s.addVariable);
  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  const nodeConfig = useMemo(
    () => nodeConfigsDict[nodeId] as V3OutputNodeConfig | undefined,
    [nodeConfigsDict, nodeId],
  );

  const flowOutputs = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.FlowOutput, variablesDict);
  }, [nodeId, variablesDict]);

  const inputVariableBlockHeightList = useMemo(() => {
    return A.make(flowOutputs.length, VARIABLE_LABEL_HEIGHT + ROW_MARGIN_TOP);
  }, [flowOutputs.length]);

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      {flowOutputs.map((output, i) => (
        <IncomingVariableHandle
          key={output.id}
          id={output.id}
          index={i}
          inputVariableBlockHeightList={inputVariableBlockHeightList}
          isShowingAddInputVariableButton
        />
      ))}
      <NodeBox nodeType={NodeType.OutputNode}>
        <NodeBoxHeaderSection
          isReadOnly={isCurrentUserOwner}
          title="Output"
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
                addVariable(
                  nodeId,
                  ConnectorType.FlowOutput,
                  flowOutputs.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          )}
        </NodeBoxSmallSection>
        <NodeBoxIncomingVariableSection>
          {flowOutputs.map((input, i) => (
            <NodeBoxIncomingVariableBlock
              key={input.id}
              name={input.name}
              isReadOnly={!isCurrentUserOwner}
              onConfirmNameChange={(name) => {
                updateVariable(input.id, { name });
              }}
              onRemove={() => {
                removeVariable(input.id);
                updateNodeInternals(nodeId);
              }}
            />
          ))}
        </NodeBoxIncomingVariableSection>
      </NodeBox>
    </>
  );
}
