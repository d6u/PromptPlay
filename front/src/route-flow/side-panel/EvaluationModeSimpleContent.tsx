import { A, D } from "@mobily/ts-belt";
import { Button } from "@mui/joy";
import { ReactNode } from "react";
import { InputValueType } from "../flowTypes";
import {
  flowInputItemsWithNodeConfigSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../store/flowStore";
import { FlowState } from "../store/storeTypes";
import InputBlock from "./InputBlock";
import {
  Section,
  HeaderSectionHeader,
  OutputValueName,
  OutputValueItem,
  HeaderSection,
  RawValue,
} from "./controls-common";

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  runFlow: state.runFlow,
  updateNodeConfig: state.updateNodeConfig,
  flowInputItems: flowInputItemsWithNodeConfigSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
  updateDefaultVariableValueMap: state.updateDefaultVariableValueMap,
});

export default function EvaluationModeSimpleContent() {
  const {
    isCurrentUserOwner,
    runFlow,
    updateNodeConfig,
    flowInputItems,
    flowOutputItems,
    defaultVariableValueMap: variableValueMap,
    updateDefaultVariableValueMap,
  } = useFlowStore(selector);

  return (
    <>
      <HeaderSection>
        <HeaderSectionHeader>Input variables</HeaderSectionHeader>
        {isCurrentUserOwner && (
          <Button color="success" onClick={runFlow}>
            Run
          </Button>
        )}
      </HeaderSection>
      <Section>
        {flowInputItems.map(({ inputItem, nodeConfig }, i) => (
          <InputBlock
            key={inputItem.id}
            isReadOnly={!isCurrentUserOwner}
            id={inputItem.id}
            name={inputItem.name}
            value={variableValueMap[inputItem.id]}
            onSaveValue={(value) => {
              updateDefaultVariableValueMap(inputItem.id, value);
            }}
            type={inputItem.valueType}
            onSaveType={(newType) => {
              if (inputItem.valueType !== newType) {
                switch (newType) {
                  case InputValueType.String:
                    updateDefaultVariableValueMap(inputItem.id, "");
                    break;
                  case InputValueType.Number:
                    updateDefaultVariableValueMap(inputItem.id, 0);
                    break;
                }
              }

              updateNodeConfig(nodeConfig.nodeId, {
                outputs: A.updateAt(
                  nodeConfig.outputs,
                  i,
                  D.set("valueType", newType)
                ),
              });
            }}
          />
        ))}
      </Section>
      <HeaderSection>
        <HeaderSectionHeader>Output values</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {flowOutputItems.map((output, i) => {
          const value = variableValueMap[output.id];

          let content: ReactNode;

          if (typeof value === "string") {
            content = value;
          } else {
            content = JSON.stringify(value, null, 2);
          }

          return (
            <OutputValueItem key={output.id}>
              <OutputValueName>{output.name}</OutputValueName>
              <RawValue>{content}</RawValue>
            </OutputValueItem>
          );
        })}
      </Section>
    </>
  );
}
