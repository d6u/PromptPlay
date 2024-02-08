import { Button, ToggleButtonGroup } from '@mui/joy';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { BatchTestTab } from 'state-flow/types';

function SubTabActionsBatchTest() {
  const selectedBatchTestTab = useFlowStore((s) => s.selectedBatchTestTab);
  const setSelectedBatchTestTab = useFlowStore(
    (s) => s.setSelectedBatchTestTab,
  );

  return (
    <ToggleButtonGroup
      size="sm"
      value={selectedBatchTestTab}
      onChange={(e, newValue) => {
        setSelectedBatchTestTab(newValue as BatchTestTab);
      }}
    >
      <Button value={BatchTestTab.RunTests}>Run Tests</Button>
      <Button value={BatchTestTab.UploadCsv}>Upload CSV</Button>
    </ToggleButtonGroup>
  );
}

export default SubTabActionsBatchTest;
