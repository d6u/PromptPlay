import styled from '@emotion/styled';
import { ComponentProps } from 'react';

import NodeAddConnectorButton from 'components/NodeAddConnectorButton';

function NodeConfigPaneAddConnectorButton(
  props: ComponentProps<typeof NodeAddConnectorButton>,
) {
  return (
    <Container>
      <NodeAddConnectorButton {...props} />
    </Container>
  );
}

const Container = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export default NodeConfigPaneAddConnectorButton;
