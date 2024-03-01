import styled from '@emotion/styled';
import { FormControl, FormLabel, Switch } from '@mui/joy';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';
import { useFlowStore } from 'state-flow/flow-store';

function LeftPaneToggle() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const canvasLeftPaneIsOpen = useFlowStore((s) => s.canvasLeftPaneIsOpen);
  const canvasselectedNodeId = useFlowStore(
    (s) => s.canvasLeftPaneSelectedNodeId,
  );
  const setCanvasLeftPaneIsOpen = useFlowStore(
    (s) => s.setCanvasLeftPaneIsOpen,
  );

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return (
        <Container
          size="md"
          orientation="horizontal"
          disabled={canvasselectedNodeId == null}
        >
          <FormLabel sx={{ cursor: 'pointer' }}>Node Config</FormLabel>
          <Switch
            color="neutral"
            size="md"
            variant={canvasLeftPaneIsOpen ? 'solid' : 'outlined'}
            // Reverse the value to match the position of the switch
            // with the open state of the right panel
            checked={canvasLeftPaneIsOpen}
            onChange={(event) => {
              setCanvasLeftPaneIsOpen(event.target.checked);
            }}
          />
        </Container>
      );
    case FlowRouteTab.BatchTest:
      return null;
  }
}

const Container = styled(FormControl)`
  grid-area: left-pane-toggle;
`;

export default LeftPaneToggle;
