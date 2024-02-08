import styled from '@emotion/styled';
import { Typography } from '@mui/joy';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';

function SavingIndicator() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const isFlowContentDirty = useFlowStore((s) => s.isFlowContentDirty);
  const isFlowContentSaving = useFlowStore((s) => s.isFlowContentSaving);

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return (
        <Container color="success" level="body-sm" variant="plain">
          {isFlowContentSaving
            ? 'Saving...'
            : isFlowContentDirty
              ? 'Save pending'
              : 'Saved'}
        </Container>
      );
    case FlowRouteTab.BatchTest:
      return null;
  }
}

const Container = styled(Typography)`
  grid-area: saving-indicator;
`;

export default SavingIndicator;
