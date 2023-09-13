import Button from "@mui/joy/Button";
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
import { FlowState, useFlowStore } from "../flowState";
import {
  FlowInputItem,
  InputNodeConfig,
  InputValueType,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import InputBlock from "./InputBlock";
import {
  Section,
  HeaderSectionHeader,
  OutputValueName,
  OutputValueItem,
  HeaderSection,
  RawValue,
  PanelContentContainer,
} from "./controls-common";

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  nodeConfigs: state.nodeConfigs,
  nodes: state.nodes,
  updateNodeConfig: state.updateNodeConfig,
});

type Props = {
  onRun: () => void;
};

export default function PanelFlowInputOutput(props: Props) {
  const { isCurrentUserOwner, nodeConfigs, nodes, updateNodeConfig } =
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
    <PanelContentContainer>
      <HeaderSection>
        <HeaderSectionHeader>Input variables</HeaderSectionHeader>
        {isCurrentUserOwner && (
          <Button color="success" onClick={props.onRun}>
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

                  updateNodeConfig(nodeConfig.nodeId, { outputs: newOutputs });
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

                  updateNodeConfig(nodeConfig.nodeId, { outputs: newOutputs });
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
                <OutputValueItem key={i}>
                  <OutputValueName>{input.name}</OutputValueName>
                  <RawValue>{content}</RawValue>
                </OutputValueItem>
              );
            })
          )
        )}
      </Section>
    </PanelContentContainer>
  );
}
