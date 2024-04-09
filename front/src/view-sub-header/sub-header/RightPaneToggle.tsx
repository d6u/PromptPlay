import styled from '@emotion/styled';
import { FormControl, FormLabel, Switch } from '@mui/joy';
import { useMemo } from 'react';
import { useReactFlow, useStoreApi } from 'reactflow';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';
import { CanvasRightPanelType } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

function RightPaneToggle() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const canvasRightPaneType = useFlowStore((s) => s.canvasRightPaneType);
  const setCanvasRightPaneType = useFlowStore((s) => s.setCanvasRightPaneType);

  const isTesterOpen = useMemo(() => {
    return canvasRightPaneType != CanvasRightPanelType.Off;
  }, [canvasRightPaneType]);

  const reactflow = useReactFlow();
  const reactflowStoreApi = useStoreApi();

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return (
        <Container size="md" orientation="horizontal">
          <FormLabel sx={{ cursor: 'pointer' }}>Tester</FormLabel>
          <Switch
            color="neutral"
            size="md"
            variant={isTesterOpen ? 'solid' : 'outlined'}
            // Reverse the value to match the position of the switch
            // with the open state of the right panel
            checked={!isTesterOpen}
            onChange={(event) => {
              setCanvasRightPaneType(
                event.target.checked
                  ? CanvasRightPanelType.Off
                  : CanvasRightPanelType.Tester,
                reactflowStoreApi.getState(),
                reactflow,
              );
            }}
          />
        </Container>
      );
    case FlowRouteTab.BatchTest:
      return null;
  }
}

const Container = styled(FormControl)`
  grid-area: right-pane-toggle;
`;

export default RightPaneToggle;
