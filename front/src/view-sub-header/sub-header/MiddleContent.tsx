import styled from '@emotion/styled';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';

import PresetSelector from '../preset-selector/PresetSelector';

function MiddleContent() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return null;
    case FlowRouteTab.BatchTest:
      return (
        <Container>
          <PresetSelector />
        </Container>
      );
  }
}

const Container = styled.div`
  grid-area: middle;
`;

export default MiddleContent;
