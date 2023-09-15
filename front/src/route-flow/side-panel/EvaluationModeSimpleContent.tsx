import { Button } from "@mui/joy";
import {
  adjust,
  assoc,
  filter,
  flatten,
  map,
  mergeLeft,
  pipe,
  propEq,
} from "ramda";
import { ReactNode, useMemo } from "react";
import {
  FlowInputItem,
  InputNodeConfig,
  InputValueType,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import { useFlowStore } from "../storeFlow";
import { FlowState } from "../storeTypes";
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
  nodeConfigs: state.nodeConfigs,
  nodes: state.nodes,
  updateNodeConfig: state.updateNodeConfig,
});

export default function EvaluationModeSimpleContent() {
  const { isCurrentUserOwner, runFlow, nodeConfigs, nodes, updateNodeConfig } =
    useFlowStore(selector);

  const inputNodeConfigs = useMemo(
    () =>
      pipe(
        filter(propEq<string>(NodeType.InputNode, "type")),
        map((node) => nodeConfigs[node.id])
      )(nodes) as InputNodeConfig[],
    [nodeConfigs, nodes]
  );

  const outputNodeConfigs = useMemo(
    () =>
      pipe(
        filter(propEq<string>(NodeType.OutputNode, "type")),
        map((node) => nodeConfigs[node.id])
      )(nodes) as OutputNodeConfig[],
    [nodeConfigs, nodes]
  );

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
        {flatten(
          inputNodeConfigs.map((nodeConfig) =>
            nodeConfig.outputs.map((output, i) => (
              <InputBlock
                key={output.id}
                isReadOnly={!isCurrentUserOwner}
                id={output.id}
                name={output.name}
                value={output.value}
                onSaveValue={(value) => {
                  const newOutputs = adjust<FlowInputItem>(
                    i,
                    assoc("value", value)<FlowInputItem>
                  )(nodeConfig.outputs);

                  updateNodeConfig(nodeConfig.nodeId, {
                    outputs: newOutputs,
                  });
                }}
                type={output.valueType}
                onSaveType={(newType) => {
                  const newOutputs = adjust<FlowInputItem>(i, (input) => {
                    const change: Partial<FlowInputItem> = {
                      valueType: newType,
                    };

                    if (input.valueType !== newType) {
                      switch (newType) {
                        case InputValueType.String:
                          change.value = "";
                          break;
                        case InputValueType.Number:
                          change.value = 0;
                          break;
                      }
                    }

                    return mergeLeft(change)(input);
                  })(nodeConfig.outputs);

                  updateNodeConfig(nodeConfig.nodeId, {
                    outputs: newOutputs,
                  });
                }}
              />
            ))
          )
        )}
      </Section>
      <HeaderSection>
        <HeaderSectionHeader>Output values</HeaderSectionHeader>
      </HeaderSection>
      <Section>
        {flatten(
          outputNodeConfigs.map((nodeConfig) =>
            nodeConfig.inputs.map((input, i) => {
              const value = input.value;

              let content: ReactNode;

              if (typeof value === "string") {
                content = value;
              } else {
                content = JSON.stringify(value, null, 2);
              }

              return (
                <OutputValueItem key={input.id}>
                  <OutputValueName>{input.name}</OutputValueName>
                  <RawValue>{content}</RawValue>
                </OutputValueItem>
              );
            })
          )
        )}
      </Section>
    </>
  );
}
