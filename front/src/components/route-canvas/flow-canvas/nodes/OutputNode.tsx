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
import { useStore } from 'zustand';
import IncomingVariableHandle from '../../../common-react-flow/handles/IncomingVariableHandle';
import NodeBox from '../../../common-react-flow/node-box/NodeBox';
import NodeBoxAddConnectorButton from '../../../common-react-flow/node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from '../../../common-react-flow/node-box/NodeBoxHeaderSection';
import NodeBoxIconGear from '../../../common-react-flow/node-box/NodeBoxIconGear';
import NodeBoxIncomingVariableBlock, {
  ROW_MARGIN_TOP,
} from '../../../common-react-flow/node-box/NodeBoxIncomingVariableBlock';
import NodeBoxIncomingVariableSection from '../../../common-react-flow/node-box/NodeBoxIncomingVariableSection';
import { VARIABLE_LABEL_HEIGHT } from '../../../common-react-flow/node-box/NodeBoxOutgoingVariableBlock';
import NodeBoxSmallSection from '../../../common-react-flow/node-box/NodeBoxSmallSection';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import { useStoreFromFlowStoreContext } from '../../../route-flow/store/FlowStoreContext';
import { selectVariables } from '../../../route-flow/store/state-utils';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';

export default function OutputNode() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  const flowStore = useStoreFromFlowStoreContext();

  const setDetailPanelContentType = useStore(
    flowStore,
    (s) => s.setDetailPanelContentType,
  );
  const nodeConfigsDict = useStore(flowStore, (s) => s.nodeConfigsDict);
  const variablesDict = useStore(flowStore, (s) => s.variablesDict);
  const removeNode = useStore(flowStore, (s) => s.removeNode);
  const addVariable = useStore(flowStore, (s) => s.addVariable);
  const updateVariable = useStore(flowStore, (s) => s.updateVariable);
  const removeVariable = useStore(flowStore, (s) => s.removeVariable);

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
