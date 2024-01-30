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
import NodeBoxHeaderSection from '../../../common-react-flow/node-box/NodeBoxHeaderSection';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import { useStoreFromFlowStoreContext } from '../../../route-flow/store/FlowStoreContext';
import { selectVariables } from '../../../route-flow/store/state-utils';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import AddVariableButton from './node-common/AddVariableButton';
import NodeInputModifyRow from './node-common/NodeInputModifyRow';
import {
  Section,
  SmallSection,
  StyledIconGear,
} from './node-common/node-common';

export default function OutputNode() {
  const nodeId = useNodeId() as NodeID;

  const { isCurrentUserOwner } = useContext(RouteFlowContext);
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

  const updateNodeInternals = useUpdateNodeInternals();

  if (!nodeConfig) {
    return null;
  }

  return (
    <>
      {flowOutputs.map((output, i) => (
        <IncomingVariableHandle key={output.id} id={output.id} index={i} />
      ))}
      <NodeBox nodeType={NodeType.OutputNode}>
        <NodeBoxHeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title="Output"
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        <SmallSection>
          <IconButton
            variant="outlined"
            onClick={() =>
              setDetailPanelContentType(
                DetailPanelContentType.EvaluationModeSimple,
              )
            }
          >
            <StyledIconGear />
          </IconButton>
          {isCurrentUserOwner && (
            <AddVariableButton
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
        </SmallSection>
        <Section>
          {flowOutputs.map((input, i) => (
            <NodeInputModifyRow
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
        </Section>
      </NodeBox>
    </>
  );
}
