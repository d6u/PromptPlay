import { A, D } from '@mobily/ts-belt';
import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Textarea,
} from '@mui/joy';
import {
  ConnectorID,
  ConnectorType,
  NodeID,
  NodeType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
import { FieldType } from 'flow-models/src/node-definition-base-types';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
import TextareaReadonly from '../components/route-flow/common/TextareaReadonly';
import {
  CopyIcon,
  LabelWithIconContainer,
} from '../components/route-flow/common/flow-common';
import { useFlowStore } from '../components/route-flow/store/FlowStoreContext';
import {
  selectConditionTarget,
  selectVariables,
} from '../components/route-flow/store/state-utils';
import { DetailPanelContentType } from '../components/route-flow/store/store-flow-state-types';
import IncomingConditionHandle from './handles/IncomingConditionHandle';
import IncomingVariableHandle from './handles/IncomingVariableHandle';
import OutgoingVariableHandle from './handles/OutgoingVariableHandle';
import NodeBox from './node-box/NodeBox';
import NodeBoxAddConnectorButton from './node-box/NodeBoxAddConnectorButton';
import NodeBoxHeaderSection from './node-box/NodeBoxHeaderSection';
import NodeBoxIconGear from './node-box/NodeBoxIconGear';
import NodeBoxIncomingVariableBlock from './node-box/NodeBoxIncomingVariableBlock';
import NodeBoxIncomingVariableSection from './node-box/NodeBoxIncomingVariableSection';
import NodeBoxOutgoingVariableBlock from './node-box/NodeBoxOutgoingVariableBlock';
import NodeBoxSection from './node-box/NodeBoxSection';
import NodeBoxSmallSection from './node-box/NodeBoxSmallSection';

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
  isNodeConfigReadOnly: boolean;
  canAddVariable: boolean;
  destConnectorReadOnlyConfigs?: boolean[];
  destConnectorHelpMessages?: ReactNode[];
  children?: ReactNode;
};

export default function ReactFlowNode(props: Props) {
  // ANCHOR: ReactFlow
  const nodeId = useNodeId() as NodeID;
  const updateNodeInternals = useUpdateNodeInternals();

  // ANCHOR: Node Definition
  const nodeDefinition = useMemo(
    () => getNodeDefinitionForNodeTypeName(props.nodeType),
    [props.nodeType],
  );

  // ANCHOR: Store Data
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const nodeConfig = useMemo(() => {
    return nodeConfigsDict[nodeId];
  }, [nodeConfigsDict, nodeId]);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

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
        nodeDefinition.incomingVariableConfigs?.[index];

      return {
        id: input.id,
        name: input.name,
        isReadOnly:
          props.isNodeConfigReadOnly ||
          (incomingVariableConfig?.isNonEditable ?? false),
        helperMessage: incomingVariableConfig?.helperMessage,
      };
    });
  }, [
    nodeId,
    variablesDict,
    nodeDefinition.incomingVariableConfigs,
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

  let bodyContent: ReactNode;

  if (nodeDefinition.fieldDefinitions == null) {
    bodyContent = props.children;
  } else {
    bodyContent = (
      <>
        {D.toPairs(nodeDefinition.fieldDefinitions).map(
          ([fieldKey, fieldDefinition], index) => {
            // NOTE: Hack to make TypeScript happy
            const fieldValue = nodeConfig[
              fieldKey as keyof typeof nodeConfig
            ] as unknown;

            // NOTE: It is fine to call `useState` and `useEffect` here
            // because the fieldDefinitions should not change

            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [localFieldValue, setLocalFieldValue] = useState(
              () => fieldValue,
            );

            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              setLocalFieldValue(() => fieldValue);
            }, [fieldValue]);

            switch (fieldDefinition.type) {
              case FieldType.Text:
                return null;
              case FieldType.Textarea:
                return (
                  <NodeBoxSection key={fieldKey}>
                    <FormControl>
                      <LabelWithIconContainer>
                        <FormLabel>{fieldDefinition.label}</FormLabel>
                        <CopyIcon
                          onClick={() => {
                            navigator.clipboard.writeText(fieldValue as string);
                          }}
                        />
                      </LabelWithIconContainer>
                      {!props.isNodeConfigReadOnly ? (
                        <Textarea
                          color="neutral"
                          variant="outlined"
                          minRows={3}
                          maxRows={5}
                          placeholder={fieldDefinition.placeholder}
                          value={localFieldValue as string}
                          onChange={(e) => {
                            setLocalFieldValue(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                              updateNodeConfig(nodeId, {
                                [fieldKey]: localFieldValue,
                              });
                            }
                          }}
                          onBlur={() => {
                            updateNodeConfig(nodeId, {
                              [fieldKey]: localFieldValue,
                            });
                          }}
                        />
                      ) : (
                        <TextareaReadonly
                          value={localFieldValue as string}
                          minRows={3}
                          maxRows={5}
                        />
                      )}
                      {fieldDefinition.helperMessage && (
                        <FormHelperText>
                          {fieldDefinition.helperMessage}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </NodeBoxSection>
                );
              case FieldType.Radio:
                return (
                  <NodeBoxSection key={fieldKey}>
                    <FormControl>
                      <FormLabel>Role</FormLabel>
                      <RadioGroup
                        orientation="horizontal"
                        value={localFieldValue as string}
                        onChange={(e) => {
                          const newFieldValue = e.target.value;
                          setLocalFieldValue(newFieldValue);
                          updateNodeConfig(nodeId, {
                            [fieldKey]: newFieldValue,
                          });
                        }}
                      >
                        {fieldDefinition.options.map((option, i) => {
                          return (
                            <Radio
                              key={i}
                              color="primary"
                              name="role"
                              label={option}
                              disabled={!!props.isNodeConfigReadOnly}
                              value={option}
                            />
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                  </NodeBoxSection>
                );
            }
          },
        )}
        {nodeDefinition.sidePanelType && (
          <NodeBoxSection>
            <IconButton
              variant="outlined"
              onClick={() => {
                setDetailPanelContentType(
                  nodeDefinition.sidePanelType as DetailPanelContentType,
                );
                setDetailPanelSelectedNodeId(nodeId);
              }}
            >
              <NodeBoxIconGear />
            </IconButton>
          </NodeBoxSection>
        )}
      </>
    );
  }

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
        nodeType={props.nodeType}
        isRunning={augment?.isRunning}
        hasError={augment?.hasError}
      >
        <NodeBoxHeaderSection
          isReadOnly={!props.isNodeConfigReadOnly}
          title={props.nodeTitle}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {props.canAddVariable && !props.isNodeConfigReadOnly && (
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
        {bodyContent}
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
