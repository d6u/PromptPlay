import styled from "@emotion/styled";
import { ReactNode, useContext } from "react";
import invariant from "ts-invariant";
import { useStore } from "zustand";
import {
  FlowOutputVariable,
  NodeOutputVariable,
  VariableValueType,
} from "../../../../../models/v3-flow-content-types";
import FlowContext from "../../../FlowContext";
import OutputDisplay from "./OutputDisplay";

type Props = {
  outputItem: FlowOutputVariable | NodeOutputVariable;
};

export default function OutputRenderer(props: Props) {
  const { flowStore } = useContext(FlowContext);
  invariant(flowStore != null, "Must provide flowStore");

  const defaultVariableValueMap = useStore(flowStore, (s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  const value = defaultVariableValueMap[props.outputItem.id];

  let valueContent: ReactNode;

  if (props.outputItem.valueType === VariableValueType.Audio) {
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

// SECTION: UI Components

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

// !SECTION
