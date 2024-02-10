import styled from '@emotion/styled';
import { A } from '@mobily/ts-belt';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorType,
  NodeConfig,
  NodeID,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeAccountLevelFields from 'components/node-fields/NodeAccountLevelFields';
import NodeInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';
import NodeVariablesEditableList from 'components/node-variables-editable-list/NodeVariablesEditableList';
import { ConnectorConfig } from 'components/node-variables-editable-list/types';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import {
  selectConditionTarget,
  selectVariables,
} from 'state-flow/util/state-utils';

import IncomingConditionHandle from '../handles/IncomingConditionHandle';
import IncomingVariableHandle from '../handles/IncomingVariableHandle';
import OutgoingVariableHandle from '../handles/OutgoingVariableHandle';
import NodeBox from './NodeBox';
import NodeBoxHeaderSection from './NodeBoxHeaderSection';
import NodeBoxOutgoingVariableBlock from './NodeBoxOutgoingVariableBlock';
import NodeBoxSection from './NodeBoxSection';

export type SrcConnector = {
  id: string;
  name: string;
  value: unknown;
};

type Props = {
  // In this component, we assume nodeConfig is not null.
  //
  // When deleting a node, there is a small delay between
  // deleting the nodeConfig and unmounting the node component,
  // which could cause errors due to nodeConfig being null.
  //
  // Thus, we pass nodeConfig through props to ensure it is not null.
  nodeConfig: NodeConfig;
  isNodeConfigReadOnly: boolean;
  children?: ReactNode;
};

function ReactFlowNode(props: Props) {
  // ANCHOR: ReactFlow
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  // ANCHOR: Node Definition
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  // ANCHOR: Store Data
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const defaultVariableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const conditionTarget = useMemo(() => {
    return selectConditionTarget(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const incomingVariables = useMemo(() => {
    const inputArray = selectVariables(
      nodeId,
      ConnectorType.NodeInput,
      variablesDict,
    );

    return inputArray.map<ConnectorConfig>((input, index) => {
      const incomingVariableConfig =
        nodeDefinition.fixedIncomingVariables?.[input.name];

      return {
        id: input.id,
        name: input.name,
        isReadOnly:
          props.isNodeConfigReadOnly || incomingVariableConfig != null,
        helperMessage: incomingVariableConfig?.helperMessage,
      };
    });
  }, [
    nodeId,
    variablesDict,
    nodeDefinition.fixedIncomingVariables,
    props.isNodeConfigReadOnly,
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

  // ANCHOR: Side Panel Operations
  const setCanvasLeftPaneIsOpen = useFlowStore(
    (s) => s.setCanvasLeftPaneIsOpen,
  );
  const setCanvasLeftPaneSelectedNodeId = useFlowStore(
    (s) => s.setCanvasLeftPaneSelectedNodeId,
  );

  // SECTION: Manage height of each variable input box
  const [inputVariableBlockHeightList, setInputVariableBlockHeightList] =
    useState<number[]>(() => {
      return A.make(incomingVariables.length, 0);
    });

  useEffect(() => {
    if (incomingVariables.length > inputVariableBlockHeightList.length) {
      // NOTE: Increase the length of destConnectorInputHeightArr when needed
      setInputVariableBlockHeightList((state) => {
        return state.concat(A.make(incomingVariables.length - state.length, 0));
      });
    }
  }, [incomingVariables.length, inputVariableBlockHeightList.length]);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [inputVariableBlockHeightList, nodeId, updateNodeInternals]);
  // !SECTION

  let children: ReactNode;
  if (props.children) {
    children = props.children;
  } else {
    children = (
      <GenericContainer>
        {nodeDefinition.accountLevelConfigFieldDefinitions && (
          <NodeAccountLevelFields
            isNodeConfigReadOnly={props.isNodeConfigReadOnly}
            accountLevelConfigFieldDefinitions={
              nodeDefinition.accountLevelConfigFieldDefinitions
            }
            nodeConfig={props.nodeConfig}
          />
        )}
        <NodeInstanceLevelFields
          isNodeConfigReadOnly={props.isNodeConfigReadOnly}
          instanceLevelConfigFieldDefinitions={
            nodeDefinition.instanceLevelConfigFieldDefinitions
          }
          nodeConfig={props.nodeConfig}
        />
      </GenericContainer>
    );
  }

  return (
    <>
      {conditionTarget && <IncomingConditionHandle id={conditionTarget.id} />}
      {incomingVariables.map((connector, i) => {
        return (
          <IncomingVariableHandle
            key={connector.id}
            id={connector.id}
            index={i}
            inputVariableBlockHeightList={inputVariableBlockHeightList}
          />
        );
      })}
      <NodeBox
        nodeType={props.nodeConfig.type}
        isRunning={augment?.isRunning}
        hasError={augment?.hasError}
      >
        <NodeBoxHeaderSection
          isReadOnly={props.isNodeConfigReadOnly}
          title={nodeDefinition.label}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
          onClickGearButton={() => {
            setCanvasLeftPaneIsOpen(true);
            setCanvasLeftPaneSelectedNodeId(nodeId);
          }}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
          onClickAddVariableButton={() => {
            addVariable(
              nodeId,
              ConnectorType.NodeInput,
              incomingVariables.length,
            );
            updateNodeInternals(nodeId);
          }}
        />
        <GenericContainer>
          <NodeVariablesEditableList
            variableConfigs={incomingVariables}
            onRowHeightChange={(index, height) => {
              setInputVariableBlockHeightList((arr) => {
                return A.updateAt(arr, index, () => height);
              });
            }}
          />
        </GenericContainer>
        {children}
        <NodeBoxSection>
          {srcConnectors.map((connector) => (
            <NodeBoxOutgoingVariableBlock
              key={connector.id}
              id={connector.id}
              name={connector.name}
              value={connector.value}
              onClick={() => {
                setCanvasLeftPaneIsOpen(true);
                setCanvasLeftPaneSelectedNodeId(nodeId);
              }}
            />
          ))}
        </NodeBoxSection>
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

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default ReactFlowNode;
