import styled from "@emotion/styled";
import { Button } from "@mui/joy";
import { useContext, useMemo } from "react";
import {
  VariableType,
  VariableValueType,
} from "../../../../../models/v3-flow-content-types";
import FlowContext from "../../../FlowContext";
import { selectAllVariables } from "../../../state/state-utils";
import { useFlowStore } from "../../../state/store-flow-state";
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
  variableMap: state.variableDict,
  runFlow: state.runFlow,
  stopRunningFlow: state.stopRunningFlow,
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
  updateVariableValueMap: state.updateVariableValueMap,
  updateVariable: state.updateVariable,
});

export default function PanelEvaluationModeSimple() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const {
    isRunning,
    variableMap,
    runFlow,
    stopRunningFlow,
    defaultVariableValueMap: variableValueMap,
    updateVariableValueMap,
    updateVariable,
  } = useFlowStore(selector);

  const flowInputs = useMemo(() => {
    return selectAllVariables(VariableType.FlowInput, variableMap);
  }, [variableMap]);

  const flowOutputs = useMemo(() => {
    return selectAllVariables(VariableType.FlowOutput, variableMap);
  }, [variableMap]);

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
        {flowInputs.map((variable, i) => (
          <InputBlock
            key={variable.id}
            isReadOnly={!isCurrentUserOwner}
            id={variable.id}
            name={variable.name}
            value={variableValueMap[variable.id]}
            onSaveValue={(value) => {
              updateVariableValueMap(variable.id, value);
            }}
            type={variable.valueType}
            onSaveType={(newType) => {
              if (newType !== variable.valueType) {
                switch (newType) {
                  case VariableValueType.String:
                    updateVariableValueMap(variable.id, "");
                    break;
                  case VariableValueType.Number:
                    updateVariableValueMap(variable.id, 0);
                    break;
                }
              }

              updateVariable(variable.id, { valueType: newType });
            }}
          />
        ))}
      </Section>
      <HeaderSection>
        <HeaderSectionHeader>Output values</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {flowOutputs.map((output) => (
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
