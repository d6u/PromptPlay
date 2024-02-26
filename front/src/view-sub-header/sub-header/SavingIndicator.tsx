import styled from '@emotion/styled';
import { Typography } from '@mui/joy';

import { FlowRouteTab, useFlowRouteSubRouteHandle } from 'generic-util/route';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';

function SavingIndicator() {
  const flowTabType = useFlowRouteSubRouteHandle((handle) => handle.tabType);

  const isSavingFlowContent = useFlowStore(
    (s) => s.getStateMachineContext().isSavingFlowContent,
  );
  const hasUnsavedChanges = useFlowStore(
    (s) => s.getStateMachineContext().hasUnsavedChanges,
  );

  switch (flowTabType) {
    case FlowRouteTab.Canvas:
      return (
        <Container color="success" level="body-sm" variant="plain">
          {isSavingFlowContent
            ? 'Saving...'
            : hasUnsavedChanges
              ? 'Change unsaved'
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
