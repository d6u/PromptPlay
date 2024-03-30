import { Button, ToggleButtonGroup } from '@mui/joy';

import { BatchTestTab } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

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
