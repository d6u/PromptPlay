import styled from '@emotion/styled';
import { ReactNode } from 'react';

import {
  FlowOutputVariable,
  NodeOutputVariable,
  VariableValueType,
} from 'flow-models';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import OutputDisplay from '../../view-right-side-pane/common/OutputDisplay';

type Props = {
  outputItem: FlowOutputVariable | NodeOutputVariable;
};

function SidePaneOutputRenderer(props: Props) {
  const defaultVariableValueMap = useFlowStore((s) =>
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
  font-size: 12px;
  display: block;
`;

const ValueRaw = styled.pre`
  margin: 0;
  border: 1px solid #ddd;
  padding: 5px 8px;
  border-radius: 5px;
  white-space: pre-wrap;
  font-size: 12px;
`;

// !SECTION

export default SidePaneOutputRenderer;
