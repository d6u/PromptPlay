import styled from '@emotion/styled';
import { FormControl, FormLabel, Switch } from '@mui/joy';
import { useMemo } from 'react';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { RightSidePanelType } from 'state-flow/types';

function RightPaneToggle() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const detailPanelContentType = useFlowStore((s) => s.detailPanelContentType);
  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );

  const isTesterOpen = useMemo(() => {
    return detailPanelContentType != RightSidePanelType.Off;
  }, [detailPanelContentType]);

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
              setDetailPanelContentType(
                event.target.checked
                  ? RightSidePanelType.Off
                  : RightSidePanelType.Tester,
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
