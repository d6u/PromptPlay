import styled from "@emotion/styled";
import { A, D } from "@mobily/ts-belt";
import { Button } from "@mui/joy";
import { useContext } from "react";
import FlowContext from "../../FlowContext";
import {
  flowInputItemsWithNodeConfigSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../../store/store-flow";
import { InputValueType } from "../../store/types-flow-content";
import { FlowState } from "../../store/types-local-state";
import InputBlock from "../common/InputBlock";
import OutputRenderer from "../common/OutputRenderer";
import {
  Section,
  HeaderSectionHeader,
  HeaderSection,
} from "../common/controls-common";

const selector = (state: FlowState) => ({
  runFlow: state.runFlow,
  updateNodeConfig: state.updateNodeConfig,
  flowInputItems: flowInputItemsWithNodeConfigSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
  updateDefaultVariableValueMap: state.updateDefaultVariableValueMap,
});

export default function PanelEvaluationModeSimple() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const {
    runFlow,
    updateNodeConfig,
    flowInputItems,
    flowOutputItems,
    defaultVariableValueMap: variableValueMap,
    updateDefaultVariableValueMap,
  } = useFlowStore(selector);

  return (
    <Container>
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
