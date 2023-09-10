import Button from "@mui/joy/Button";
import { adjust, assoc, filter, flatten, map, pipe, propEq } from "ramda";
import { ReactNode, useMemo } from "react";
import { FlowState, useFlowStore } from "../flowState";
import {
  FlowInputItem,
  InputNodeConfig,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import InputBlock from "./InputBlock";
import { RawValue } from "./commonStyledComponents";
import { PanelContentContainer } from "./commonStyledComponents";
import { HeaderSection } from "./commonStyledComponents";
import { OutputValueItem } from "./commonStyledComponents";
import { OutputValueName } from "./commonStyledComponents";
import { HeaderSectionHeader } from "./commonStyledComponents";
import { Section } from "./commonStyledComponents";

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  nodes: state.nodes,
  updateNodeConfig: state.updateNodeConfig,
});

type Props = {
  onRun: () => void;
};

export default function PanelFlowInputOutput(props: Props) {
  const { nodeConfigs, nodes, updateNodeConfig } = useFlowStore(selector);

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
        <Button color="success" onClick={props.onRun} size="sm" variant="solid">
          Run
        </Button>
      </HeaderSection>
      <Section>
        {flatten(
          inputNodeConfigs.map((nodeConfig) =>
            nodeConfig.outputs.map((output, i) => (
              <InputBlock
                key={output.id}
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
                onSaveType={(type) => {
                  const newOutputs = adjust<FlowInputItem>(
                    i,
                    assoc("valueType", type)<FlowInputItem>
                  )(nodeConfig.outputs);

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
