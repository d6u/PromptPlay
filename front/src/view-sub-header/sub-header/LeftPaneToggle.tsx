import styled from '@emotion/styled';
import { Button, ToggleButtonGroup } from '@mui/joy';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';
import { useFlowStore } from 'state-flow/flow-store';
import { CanvasLeftPaneType } from 'state-flow/types';

function LeftPaneToggle() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const canvasLeftPaneType = useFlowStore((s) => s.canvasLeftPaneType);
  const canvasselectedNodeId = useFlowStore(
    (s) => s.canvasLeftPaneSelectedNodeId,
  );
  const setCanvasLeftPaneType = useFlowStore((s) => s.setCanvasLeftPaneType);

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return (
        <Container
          size="sm"
          value={canvasLeftPaneType}
          onChange={(e, value) => {
            setCanvasLeftPaneType(value as CanvasLeftPaneType);
          }}
        >
          <Button value={CanvasLeftPaneType.Off}>Off</Button>
          <Button value={CanvasLeftPaneType.AddNode}>Add Node</Button>
          <Button
            value={CanvasLeftPaneType.Inspector}
            disabled={canvasselectedNodeId == null}
          >
            Inspector
          </Button>
        </Container>
      );
    case FlowRouteTab.BatchTest:
      return null;
  }
}

const Container = styled(ToggleButtonGroup)`
  grid-area: left-pane-toggle;
`;

export default LeftPaneToggle;
