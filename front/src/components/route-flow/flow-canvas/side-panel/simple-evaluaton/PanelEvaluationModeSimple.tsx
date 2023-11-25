import styled from "@emotion/styled";
import { A, D } from "@mobily/ts-belt";
import { Button } from "@mui/joy";
import { useContext } from "react";
import { InputValueType } from "../../../../../models/v2-flow-content-types";
import FlowContext from "../../../FlowContext";
import {
  flowInputItemsWithNodeConfigSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../../../state/store-flow-state";
import { FlowState } from "../../../state/store-flow-state-types";
import {
  HeaderSection,
  HeaderSectionHeader,
  Section,
} from "../common/controls-common";
import InputBlock from "../common/InputBlock";
import OutputRenderer from "../common/OutputRenderer";

const selector = (state: FlowState) => ({
  isRunning: state.isRunning,
  runFlow: state.runFlow,
  stopRunningFlow: state.stopRunningFlow,
  updateNodeConfig: state.updateNodeConfig,
  flowInputItems: flowInputItemsWithNodeConfigSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
  updateVariableValueMap: state.updateVariableValueMap,
});

export default function PanelEvaluationModeSimple() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const {
    isRunning,
    runFlow,
    stopRunningFlow,
    updateNodeConfig,
    flowInputItems,
    flowOutputItems,
    defaultVariableValueMap: variableValueMap,
    updateVariableValueMap,
  } = useFlowStore(selector);

  return (
    <Container>
      <HeaderSection>
        <HeaderSectionHeader>Input variables</HeaderSectionHeader>
        {isCurrentUserOwner && (
          <Button
            color={isRunning ? "danger" : "success"}
            onClick={isRunning ? stopRunningFlow : runFlow}
          >
            {isRunning ? "Stop" : "Run"}
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
              updateVariableValueMap(inputItem.id, value);
            }}
            type={inputItem.valueType}
            onSaveType={(newType) => {
              if (inputItem.valueType !== newType) {
                switch (newType) {
                  case InputValueType.String:
                    updateVariableValueMap(inputItem.id, "");
                    break;
                  case InputValueType.Number:
                    updateVariableValueMap(inputItem.id, 0);
                    break;
                }
              }

              updateNodeConfig(nodeConfig.nodeId, {
                outputs: A.updateAt(
                  nodeConfig.outputs,
                  i,
                  D.set("valueType", newType),
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
        {flowOutputItems.map((output) => (
          <OutputRenderer key={output.id} outputItem={output} />
        ))}
      </Section>
    </Container>
  );
}

const Container = styled.div`
  width: 50vw;
  max-width: 600px;
  padding: 20px;
`;
