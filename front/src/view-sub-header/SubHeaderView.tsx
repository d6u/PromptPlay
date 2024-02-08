import styled from '@emotion/styled';
import { useContext } from 'react';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';

import MiddleContent from './sub-header/MiddleContent';
import MoreMenu from './sub-header/MoreMenu';
import RightPaneToggle from './sub-header/RightPaneToggle';
import SavingIndicator from './sub-header/SavingIndicator';
import SubHeaderActions from './sub-header/SubHeaderActions';
import TabSwitcher from './sub-header/TabSwitcher';

function SubHeaderView() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  return (
    <Container>
      {isCurrentUserOwner && (
        <>
          <TabSwitcher />
          <SubHeaderActions />
          <MiddleContent />
          <SavingIndicator />
          <RightPaneToggle />
          <MoreMenu />
        </>
      )}
    </Container>
  );
}

// ANCHOR: UI Components

const Container = styled.div`
  grid-area: sub-header;
  display: grid;
  grid-template-columns: max-content max-content max-content auto max-content max-content max-content;
  grid-template-rows: 1fr;
  grid-template-areas: 'tab-switcher left-pane-toggle sub-header-actions middle saving-indicator right-pane-toggle more-menu';
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid #ececf1;
  padding: 0 20px;
`;

export default SubHeaderView;
