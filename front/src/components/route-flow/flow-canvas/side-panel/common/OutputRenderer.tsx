import styled from "@emotion/styled";
import { ReactNode } from "react";
import {
  FlowOutputItem,
  NodeOutputItem,
  OutputValueType,
} from "../../../../../models/v2-flow-content-types";
import { useFlowStore } from "../../../state/store-flow";
import { FlowState } from "../../../state/types-local-state";
import OutputDisplay from "./OutputDisplay";

const selector = (state: FlowState) => ({
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

type Props = {
  outputItem: FlowOutputItem | NodeOutputItem;
};

export default function OutputRenderer(props: Props) {
  const { defaultVariableValueMap: variableValueMap } = useFlowStore(selector);

  const value = variableValueMap[props.outputItem.id];

  let valueContent: ReactNode;

  if (props.outputItem.valueType === OutputValueType.Audio) {
    valueContent = <audio controls src={value as string} />;
  } else {
    valueContent = (
      <ValueRaw>
        <OutputDisplay value={value} />
      </ValueRaw>
    );
  }

  return (
    <Container key={props.outputItem.id}>
      <Name>{props.outputItem.name}</Name>
      {valueContent}
    </Container>
  );
}

const Container = styled.div`
  margin-bottom: 10px;
`;

const Name = styled.code`
  margin: 0 0 5px 0;
  font-size: 14px;
  display: block;
`;

const ValueRaw = styled.pre`
  margin: 0;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
`;
