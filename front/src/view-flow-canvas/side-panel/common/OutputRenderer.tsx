import styled from '@emotion/styled';
import {
  FlowOutputVariable,
  NodeOutputVariable,
  VariableValueType,
} from 'flow-models';
import { ReactNode } from 'react';
import { useStoreFromFlowStoreContext } from 'state-flow/context/FlowStoreContext';
import { useStore } from 'zustand';
import OutputDisplay from './OutputDisplay';

type Props = {
  outputItem: FlowOutputVariable | NodeOutputVariable;
};

export default function OutputRenderer(props: Props) {
  const flowStore = useStoreFromFlowStoreContext();

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
