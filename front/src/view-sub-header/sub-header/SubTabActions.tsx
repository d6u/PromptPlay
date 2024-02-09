import styled from '@emotion/styled';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';

import SubTabActionsBatchTest from './SubTabActionsBatchTest';
import SubTabActionsCanvas from './SubTabActionsCanvas';

function SubHeaderActions() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return (
        <Container>
          <SubTabActionsCanvas />
        </Container>
      );
    case FlowRouteTab.BatchTest:
      return (
        <Container>
          <SubTabActionsBatchTest />
        </Container>
      );
  }
}

const Container = styled.div`
  grid-area: sub-tab-actions;
`;

export default SubHeaderActions;
