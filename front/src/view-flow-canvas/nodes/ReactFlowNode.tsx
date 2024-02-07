import { A } from '@mobily/ts-belt';
import { IconButton } from '@mui/joy';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';

import {
  ConnectorID,
  ConnectorType,
  NodeID,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { DetailPanelContentType } from 'state-flow/types';
import {
  selectConditionTarget,
  selectVariables,
} from 'state-flow/util/state-utils';

import NodeBoxAccountLevelFields from 'view-flow-canvas/node-box/NodeBoxAccountLevelFields';
import NodeBoxInstanceLevelFields from 'view-flow-canvas/node-box/NodeBoxInstanceLevelFields';
import IncomingConditionHandle from '../handles/IncomingConditionHandle';
import IncomingVariableHandle from '../handles/IncomingVariableHandle';
import OutgoingVariableHandle from '../handles/OutgoingVariableHandle';
import NodeBox from '../node-box/NodeBox';
import NodeBoxAddConnectorButton from '../node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from '../node-box/NodeBoxHeaderSection';
import NodeBoxIconGear from '../node-box/NodeBoxIconGear';
import NodeBoxIncomingVariableBlock from '../node-box/NodeBoxIncomingVariableBlock';
import NodeBoxIncomingVariableSection from '../node-box/NodeBoxIncomingVariableSection';
import NodeBoxOutgoingVariableBlock from '../node-box/NodeBoxOutgoingVariableBlock';
import NodeBoxSection from '../node-box/NodeBoxSection';
import NodeBoxSmallSection from '../node-box/NodeBoxSmallSection';

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
  isNodeConfigReadOnly: boolean;
  canAddVariable?: boolean;
  destConnectorReadOnlyConfigs?: boolean[];
  destConnectorHelpMessages?: ReactNode[];
  children?: ReactNode;
};

export default function ReactFlowNode(props: Props) {
  // ANCHOR: ReactFlow
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  // ANCHOR: Node Config
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId];
  }, [nodeConfigsDict, nodeId]);

  // ANCHOR: Node Definition
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(nodeConfig.type),
    [nodeConfig.type],
  );

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
      const incomingVariableConfig =
        nodeDefinition.fixedIncomingVariables?.[index];

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
  const [inputVariableBlockHeightList, setInputVariableBlockHeightList] =
    useState<number[]>(() => {
      return A.make(destConnectors.length, 0);
    });

  useEffect(() => {
    if (destConnectors.length > inputVariableBlockHeightList.length) {
      // NOTE: Increase the length of destConnectorInputHeightArr when needed
      setInputVariableBlockHeightList((state) => {
        return state.concat(A.make(destConnectors.length - state.length, 0));
      });
    }
  }, [destConnectors.length, inputVariableBlockHeightList.length]);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [inputVariableBlockHeightList, nodeId, updateNodeInternals]);
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
            inputVariableBlockHeightList={inputVariableBlockHeightList}
            isShowingAddInputVariableButton={props.canAddVariable}
          />
        );
      })}
      <NodeBox
        nodeType={nodeConfig.type}
        isRunning={augment?.isRunning}
        hasError={augment?.hasError}
      >
        <NodeBoxHeaderSection
          isReadOnly={!props.isNodeConfigReadOnly}
          title={nodeDefinition.label}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {(props.canAddVariable || nodeDefinition.canUserAddIncomingVariables) &&
          !props.isNodeConfigReadOnly && (
            <NodeBoxSmallSection>
              <NodeBoxAddConnectorButton
                label="Variable"
                onClick={() => {
                  addVariable(
                    nodeId,
                    ConnectorType.NodeInput,
                    destConnectors.length,
                  );
                  updateNodeInternals(nodeId);
                }}
              />
            </NodeBoxSmallSection>
          )}
        <NodeBoxIncomingVariableSection>
          {destConnectors.map((connector, i) => {
            return (
              <NodeBoxIncomingVariableBlock
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
                  setInputVariableBlockHeightList((arr) => {
                    return A.updateAt(arr, i, () => height);
                  });
                }}
              />
            );
          })}
        </NodeBoxIncomingVariableSection>
        {props.children ? (
          props.children
        ) : (
          <>
            <NodeBoxAccountLevelFields
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              accountLevelConfigFieldDefinitions={
                nodeDefinition.accountLevelConfigFieldDefinitions ?? {}
              }
              nodeConfig={nodeConfig}
            />
            <NodeBoxInstanceLevelFields
              isNodeConfigReadOnly={props.isNodeConfigReadOnly}
              instanceLevelConfigFieldDefinitions={
                nodeDefinition.instanceLevelConfigFieldDefinitions
              }
              nodeConfig={nodeConfig}
            />
          </>
        )}
        {nodeDefinition.tmpSidePanelType && (
          <NodeBoxSection>
            <IconButton
              variant="outlined"
              onClick={() => {
                setDetailPanelContentType(
                  nodeDefinition.tmpSidePanelType as DetailPanelContentType,
                );
                setDetailPanelSelectedNodeId(nodeId);
              }}
            >
              <NodeBoxIconGear />
            </IconButton>
          </NodeBoxSection>
        )}
        <NodeBoxSection>
          {srcConnectors.map((connector) => (
            <NodeBoxOutgoingVariableBlock
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
