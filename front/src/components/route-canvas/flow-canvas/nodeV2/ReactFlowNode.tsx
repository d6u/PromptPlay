import { A } from '@mobily/ts-belt';
import { ConnectorID, ConnectorType, NodeID, NodeType } from 'flow-models';
import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
import NodeBox, { NodeState } from '../../../common-react-flow/NodeBox';
import IncomingConditionHandle from '../../../common-react-flow/handles/IncomingConditionHandle';
import IncomingVariableHandle from '../../../common-react-flow/handles/IncomingVariableHandle';
import OutgoingVariableHandle from '../../../common-react-flow/handles/OutgoingVariableHandle';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';
import {
  selectConditionTarget,
  selectVariables,
} from '../../../route-flow/store/state-utils';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import AddVariableButton from '../nodes/node-common/AddVariableButton';
import HeaderSection from '../nodes/node-common/HeaderSection';
import NodeInputModifyRow from '../nodes/node-common/NodeInputModifyRow';
import NodeOutputRow from '../nodes/node-common/NodeOutputRow';
import { Section, SmallSection } from '../nodes/node-common/node-common';

export type DestConnector = {
  id: string;
  name: string;
  isReadOnly: boolean;
  helperMessage?: ReactNode;
};

export type SrcConnector = {
  id: string;
  name: string;
  value: unknown;
};

type Props = {
  nodeType: NodeType;
  nodeTitle: string;
  allowAddVariable: boolean;
  destConnectorReadOnlyConfigs?: boolean[];
  destConnectorHelpMessages?: ReactNode[];
  children?: ReactNode;
};

export default function ReactFlowNode(props: Props) {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // ANCHOR: ReactFlow
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  // ANCHOR: Store Data
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const defaultVariableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const conditionTarget = useMemo(() => {
    return selectConditionTarget(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const destConnectors = useMemo(() => {
    const inputArray = selectVariables(
      nodeId,
      ConnectorType.NodeInput,
      variablesDict,
    );

    return inputArray.map<DestConnector>((input, index) => {
      return {
        id: input.id,
        name: input.name,
        isReadOnly:
          !isCurrentUserOwner ||
          (props.destConnectorReadOnlyConfigs?.[index] ?? false),
        helperMessage: props.destConnectorHelpMessages?.[index],
      };
    });
  }, [
    isCurrentUserOwner,
    nodeId,
    variablesDict,
    props.destConnectorHelpMessages,
    props.destConnectorReadOnlyConfigs,
  ]);

  const srcConnectors = useMemo(() => {
    const outputVariables = selectVariables(
      nodeId,
      ConnectorType.NodeOutput,
      variablesDict,
    );

    return outputVariables.map<SrcConnector>((output) => {
      return {
        id: output.id,
        name: output.name,
        value: defaultVariableValueMap[output.id],
      };
    });
  }, [defaultVariableValueMap, nodeId, variablesDict]);

  // ANCHOR: Node Metadata
  const nodeMetadataDict = useFlowStore((s) => s.nodeMetadataDict);
  const augment = useMemo(() => {
    return nodeMetadataDict[nodeId];
  }, [nodeMetadataDict, nodeId]);

  // ANCHOR: Node Operations
  const removeNode = useFlowStore((s) => s.removeNode);

  // ANCHOR: Variable Operations
  const addVariable = useFlowStore((s) => s.addVariable);
  const updateVariable = useFlowStore((s) => s.updateVariable);
  const removeVariable = useFlowStore((s) => s.removeVariable);

  // ANCHOR: Side Panel Operations
  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );
  const setDetailPanelSelectedNodeId = useFlowStore(
    (s) => s.setDetailPanelSelectedNodeId,
  );

  // SECTION: Manage height of each variable input box
  const [destConnectorInputHeightArr, setDestConnectorInputHeightArr] =
    useState<number[]>(() => {
      return A.make(destConnectors.length, 0);
    });

  useEffect(() => {
    if (destConnectors.length > destConnectorInputHeightArr.length) {
      // NOTE: Increase the length of destConnectorInputHeightArr when needed
      setDestConnectorInputHeightArr((state) => {
        return state.concat(A.make(destConnectors.length - state.length, 0));
      });
    }
  }, [destConnectors.length, destConnectorInputHeightArr.length]);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [destConnectorInputHeightArr, nodeId, updateNodeInternals]);
  // !SECTION

  return (
    <>
      {conditionTarget && <IncomingConditionHandle id={conditionTarget.id} />}
      {destConnectors.map((connector, i) => {
        return (
          <IncomingVariableHandle
            key={connector.id}
            id={connector.id}
            index={i}
            inputVariableBlockHeightList={destConnectorInputHeightArr}
            isShowingAddInputVariableButton={props.allowAddVariable}
          />
        );
      })}
      <NodeBox
        nodeType={props.nodeType}
        state={
          augment?.isRunning
            ? NodeState.Running
            : augment?.hasError
              ? NodeState.Error
              : NodeState.Idle
        }
      >
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title={props.nodeTitle}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {props.allowAddVariable && isCurrentUserOwner && (
          <SmallSection>
            <AddVariableButton
              onClick={() => {
                addVariable(
                  nodeId,
                  ConnectorType.NodeInput,
                  destConnectors.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          </SmallSection>
        )}
        <Section>
          {destConnectors.map((connector, i) => {
            return (
              <NodeInputModifyRow
                key={connector.id}
                name={connector.name}
                isReadOnly={connector.isReadOnly}
                helperMessage={connector.helperMessage}
                onConfirmNameChange={(name) => {
                  if (!connector.isReadOnly) {
                    updateVariable(connector.id as ConnectorID, { name });
                  }
                }}
                onRemove={() => {
                  if (!connector.isReadOnly) {
                    removeVariable(connector.id as ConnectorID);
                    updateNodeInternals(nodeId);
                  }
                }}
                onHeightChange={(height: number) => {
                  setDestConnectorInputHeightArr((arr) => {
                    return A.updateAt(arr, i, () => height);
                  });
                }}
              />
            );
          })}
        </Section>
        {props.children}
        <Section>
          {srcConnectors.map((connector) => (
            <NodeOutputRow
              key={connector.id}
              id={connector.id}
              name={connector.name}
              value={connector.value}
              onClick={() => {
                setDetailPanelContentType(
                  DetailPanelContentType.ChatGPTMessageConfig,
                );
                setDetailPanelSelectedNodeId(nodeId);
              }}
            />
          ))}
        </Section>
      </NodeBox>
      {srcConnectors.map((connector, i) => (
        <OutgoingVariableHandle
          key={connector.id}
          id={connector.id}
          index={i}
          totalVariableCount={srcConnectors.length}
        />
      ))}
    </>
  );
}
