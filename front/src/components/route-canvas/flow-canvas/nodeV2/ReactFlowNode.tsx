import { A } from '@mobily/ts-belt';
import {
  ConditionTarget,
  ConnectorID,
  ConnectorType,
  NodeID,
  NodeType,
} from 'flow-models';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import RouteFlowContext from '../../../route-flow/common/RouteFlowContext';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import AddVariableButton from '../nodes/node-common/AddVariableButton';
import HeaderSection from '../nodes/node-common/HeaderSection';
import NodeBox from '../nodes/node-common/NodeBox';
import NodeInputModifyRow from '../nodes/node-common/NodeInputModifyRow';
import NodeOutputRow from '../nodes/node-common/NodeOutputRow';
import {
  ConditionTargetHandle,
  InputHandle,
  OutputHandle,
  Section,
  SmallSection,
} from '../nodes/node-common/node-common';
import {
  calculateInputHandleTopV2,
  calculateOutputHandleBottom,
} from '../nodes/node-common/utils';

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
  nodeTitle: string;
  conditionTarget?: ConditionTarget | null;
  destConnectors: DestConnector[];
  srcConnectors: SrcConnector[];
  children?: ReactNode;
};

export default function ReactFlowNode(props: Props) {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  // ANCHOR: ReactFlow
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

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
      return A.make(props.destConnectors.length, 0);
    });

  useEffect(() => {
    if (props.destConnectors.length > destConnectorInputHeightArr.length) {
      // NOTE: Increase the length of destConnectorInputHeightArr when needed
      setDestConnectorInputHeightArr((state) => {
        return state.concat(
          A.make(props.destConnectors.length - state.length, 0),
        );
      });
    }
  }, [props.destConnectors.length, destConnectorInputHeightArr.length]);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [destConnectorInputHeightArr, nodeId, updateNodeInternals]);
  // !SECTION

  return (
    <>
      {props.conditionTarget && (
        <ConditionTargetHandle controlId={props.conditionTarget.id} />
      )}
      {props.destConnectors.map((connector, i) => {
        return (
          <InputHandle
            key={connector.id}
            type="target"
            id={connector.id}
            position={Position.Left}
            style={{
              top: calculateInputHandleTopV2(i, destConnectorInputHeightArr),
            }}
          />
        );
      })}
      <NodeBox nodeType={NodeType.ChatGPTMessageNode}>
        <HeaderSection
          isCurrentUserOwner={isCurrentUserOwner}
          title={props.nodeTitle}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {isCurrentUserOwner && (
          <SmallSection>
            <AddVariableButton
              onClick={() => {
                addVariable(
                  nodeId,
                  ConnectorType.NodeInput,
                  props.destConnectors.length,
                );
                updateNodeInternals(nodeId);
              }}
            />
          </SmallSection>
        )}
        <Section>
          {props.destConnectors.map((connector, i) => {
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
          {props.srcConnectors.map((connector) => (
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
      {props.srcConnectors.map((connector, i) => (
        <OutputHandle
          key={connector.id}
          type="source"
          id={connector.id}
          position={Position.Right}
          style={{
            bottom: calculateOutputHandleBottom(
              props.srcConnectors.length - 1 - i,
            ),
          }}
        />
      ))}
    </>
  );
}
