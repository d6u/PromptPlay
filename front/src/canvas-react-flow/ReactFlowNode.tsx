import { A, D } from '@mobily/ts-belt';
import {
  FormControl,
  FormLabel,
  IconButton,
  Option,
  Radio,
  RadioGroup,
  Select,
} from '@mui/joy';
import {
  ConnectorID,
  ConnectorType,
  NodeID,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
import { FieldType } from 'flow-models/src/node-definition-base-types';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNodeId, useUpdateNodeInternals } from 'reactflow';
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
import NodeCheckboxField from './node-fields/NodeCheckboxField';
import NodeNumberField from './node-fields/NodeNumberField';
import NodeTextField from './node-fields/NodeTextField';
import NodeTextareaField from './node-fields/NodeTextareaField';

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

  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

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
            // TODO: Find a type safe way
            // NOTE: Hack to make TypeScript happy
            const fieldValue = nodeConfig[
              fieldKey as keyof typeof nodeConfig
            ] as unknown;

            // NOTE: It is fine to call `useState` and `useEffect` here
            // because the fieldDefinitions should not change

            // TODO: When value is a number type, convert to string
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
                return (
                  <NodeTextField
                    key={fieldKey}
                    fieldKey={fieldKey}
                    fieldDefinition={fieldDefinition}
                    fieldValue={fieldValue}
                    isNodeConfigReadOnly={props.isNodeConfigReadOnly}
                    onSave={(value) => {
                      updateNodeConfig(nodeId, { [fieldKey]: value });
                    }}
                  />
                );
              case FieldType.Number:
                return (
                  <NodeNumberField
                    key={fieldKey}
                    fieldKey={fieldKey}
                    fieldDefinition={fieldDefinition}
                    fieldValue={fieldValue as number | null}
                    isNodeConfigReadOnly={props.isNodeConfigReadOnly}
                    onSave={(value) => {
                      updateNodeConfig(nodeId, { [fieldKey]: value });
                    }}
                  />
                );
              case FieldType.Textarea:
                return (
                  <NodeTextareaField
                    key={fieldKey}
                    fieldKey={fieldKey}
                    fieldDefinition={fieldDefinition}
                    fieldValue={fieldValue as string}
                    isNodeConfigReadOnly={props.isNodeConfigReadOnly}
                    onSave={(value) => {
                      updateNodeConfig(nodeId, { [fieldKey]: value });
                    }}
                  />
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
                              label={option.label}
                              disabled={!!props.isNodeConfigReadOnly}
                              value={option.value}
                            />
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                  </NodeBoxSection>
                );
              case FieldType.Select:
                return (
                  <NodeBoxSection key={fieldKey}>
                    <FormControl>
                      <FormLabel>Model</FormLabel>
                      <Select
                        disabled={props.isNodeConfigReadOnly}
                        value={localFieldValue}
                        onChange={(_, value) => {
                          setLocalFieldValue(value);
                          updateNodeConfig(nodeId, { [fieldKey]: value });
                        }}
                      >
                        {fieldDefinition.options.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </NodeBoxSection>
                );
              case FieldType.Checkbox:
                return (
                  <NodeCheckboxField
                    key={fieldKey}
                    fieldKey={fieldKey}
                    fieldDefinition={fieldDefinition}
                    fieldValue={fieldValue}
                    isNodeConfigReadOnly={props.isNodeConfigReadOnly}
                    onSave={(value) => {
                      updateNodeConfig(nodeId, { [fieldKey]: value });
                    }}
                  />
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
        nodeType={nodeConfig.type}
        isRunning={augment?.isRunning}
        hasError={augment?.hasError}
      >
        <NodeBoxHeaderSection
          isReadOnly={!props.isNodeConfigReadOnly}
          title={nodeDefinition.toolbarLabel!}
          onClickRemove={() => {
            removeNode(nodeId);
          }}
        />
        {(props.canAddVariable || nodeDefinition.canAddIncomingVariables) &&
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
