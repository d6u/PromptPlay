import styled from '@emotion/styled';
import { ReactNode, useMemo } from 'react';
import { Position, useNodeId, useUpdateNodeInternals } from 'reactflow';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeConfig,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import NodeAccountLevelFields from 'components/node-fields/NodeAccountLevelFields';
import NodeInstanceLevelFields from 'components/node-fields/NodeInstanceLevelFields';
import NodeVariableResultItem from 'components/node-variables-editable-list/NodeVariableResultItem';
import NodeVariablesEditableList from 'components/node-variables-editable-list/NodeVariablesEditableList';
import { useFlowStore } from 'state-flow/flow-store';
import {
  selectConditionTarget,
  selectVariables,
} from 'state-flow/util/state-utils';

import IncomingConditionHandle from '../handles/IncomingConditionHandle';
import NodeBox from './NodeBox';
import NodeBoxHeaderSection from './NodeBoxHeaderSection';
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
  const nodeId = useNodeId();

  invariant(nodeId != null, 'nodeId is not null');

  const updateNodeInternals = useUpdateNodeInternals();

  // ANCHOR: Node Definition
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeConfig.type),
    [props.nodeConfig.type],
  );

  // ANCHOR: Store Data
  const variablesDict = useFlowStore((s) => s.getFlowContent().variablesDict);
  const defaultVariableValueMap = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );
  const conditionTarget = useMemo(() => {
    return selectConditionTarget(nodeId, variablesDict);
  }, [nodeId, variablesDict]);

  const incomingVariables = useMemo(() => {
    return selectVariables(nodeId, ConnectorType.NodeInput, variablesDict);
  }, [nodeId, variablesDict]);

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
      <NodeBox
        nodeType={props.nodeConfig.type}
        isRunning={augment?.isRunning}
        hasError={augment?.hasError}
      >
        <NodeBoxHeaderSection
          title={nodeDefinition.label}
          showAddVariableButton={!!nodeDefinition.canUserAddIncomingVariables}
          isNodeReadOnly={props.isNodeConfigReadOnly}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
          onClickGearButton={() => {
            setCanvasLeftPaneIsOpen(true);
            setCanvasLeftPaneSelectedNodeId(nodeId);
          }}
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
            showConnectorHandle={Position.Left}
            nodeId={nodeId}
            isNodeReadOnly={props.isNodeConfigReadOnly}
            variableConfigs={incomingVariables.map((variable) => {
              const incomingVariableConfig =
                nodeDefinition.fixedIncomingVariables?.[variable.name];

              return {
                id: variable.id,
                name: variable.name,
                isReadOnly: incomingVariableConfig != null,
                helperMessage: incomingVariableConfig?.helperMessage,
              };
            })}
          />
        </GenericContainer>
        {children}
        <NodeBoxSection>
          {srcConnectors.map((connector) => (
            <NodeVariableResultItem
              key={connector.id}
              variableId={connector.id}
              variableName={connector.name}
              variableValue={connector.value}
              nodeId={nodeId}
            />
          ))}
        </NodeBoxSection>
      </NodeBox>
    </>
  );
}

const GenericContainer = styled.div`
  padding-left: 10px;
  padding-right: 10px;
`;

export default ReactFlowNode;
