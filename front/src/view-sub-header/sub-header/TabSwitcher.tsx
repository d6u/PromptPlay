import styled from '@emotion/styled';
import { Button, ToggleButtonGroup } from '@mui/joy';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FlowRouteTab,
  pathToFlowBatchTestTab,
  pathToFlowCanvasTab,
  useFlowRouteSubRouteHandle,
} from 'generic-util/route';
import RouteFlowContext from 'state-flow/context/FlowRouteContext';

function TabSwitcher() {
  const navigate = useNavigate();

  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const { spaceId } = useContext(RouteFlowContext);

  return (
    <Container
      size="sm"
      value={flowTabType}
      onChange={(e, newValue) => {
        switch (newValue as FlowRouteTab) {
          case FlowRouteTab.Canvas:
            navigate(pathToFlowCanvasTab(spaceId));
            break;
          case FlowRouteTab.BatchTest:
            navigate(pathToFlowBatchTestTab(spaceId));
            break;
        }
      }}
    >
      <Button value={FlowRouteTab.Canvas}>Canvas</Button>
      <Button value={FlowRouteTab.BatchTest}>Batch Test</Button>
    </Container>
  );
}

const Container = styled(ToggleButtonGroup)`
  grid-area: tab-switcher;
`;

export default TabSwitcher;
