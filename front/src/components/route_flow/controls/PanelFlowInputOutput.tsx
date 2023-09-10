import Button from "@mui/joy/Button";
import { adjust, assoc, filter, flatten, map, pipe, propEq } from "ramda";
import { ReactNode, useMemo } from "react";
import styled from "styled-components";
import { FlowState, useFlowStore } from "../flowState";
import {
  FlowInputItem,
  InputNodeConfig,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import InputBlock from "./InputBlock";
import { RawValue } from "./commonStyledComponents";

const Container = styled.div`
  padding: 20px 20px 0 20px;
`;

const HeaderSection = styled.div`
  margin: 0 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${32 + 5}px;
`;

const SectionHeader = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const OutputValueItem = styled.div`
  margin-bottom: 10px;
`;

const OutputValueName = styled.code`
  margin: 0 0 5px 0;
  font-size: 14px;
  display: block;
`;

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
    <Container>
      <HeaderSection>
        <SectionHeader>Input variables</SectionHeader>
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
        <SectionHeader>Output values</SectionHeader>
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
    </Container>
  );
}
