import styled from '@emotion/styled';
import { ReactNode } from 'react';

import {
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
} from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';
import invariant from 'tiny-invariant';
import OutputDisplay from 'view-right-side-pane/common/OutputDisplay';

type Props = {
  outputItem: NodeOutputVariable | NodeInputVariable;
};

function SidePaneOutputRenderer(props: Props) {
  const connectorResults = useFlowStore((s) =>
    s.getDefaultVariableValueLookUpDict(),
  );

  const variableResult = connectorResults[props.outputItem.id];

  invariant('value' in variableResult, 'variableResult should have value prop');

  let valueContent: ReactNode;

  if (props.outputItem.valueType === VariableValueType.Audio) {
    valueContent = <audio controls src={variableResult.value as string} />;
  } else {
    valueContent = (
      <ValueRaw>
        <OutputDisplay value={variableResult.value} />
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
