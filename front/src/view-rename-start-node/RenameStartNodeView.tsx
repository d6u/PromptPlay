import styled from '@emotion/styled';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy';
import { NodeClass } from 'flow-models';
import { useEffect, useMemo, useState } from 'react';
import { useFlowStore } from 'state-flow/flow-store';
import invariant from 'tiny-invariant';

function RenameStartNodeView() {
  const canvasRenameNodeId = useFlowStore((s) => s.canvasRenameNodeId);
  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);
  const setCanvasRenameNodeId = useFlowStore((s) => s.setCanvasRenameNodeId);

  const selectedNodeConfig = useMemo(() => {
    if (canvasRenameNodeId == null) {
      return null;
    }
    return nodeConfigs[canvasRenameNodeId];
  }, [canvasRenameNodeId, nodeConfigs]);

  const [name, setName] = useState('');

  useEffect(() => {
    if (selectedNodeConfig) {
      invariant(
        selectedNodeConfig.class === NodeClass.Start,
        'Node class should be Start',
      );

      setName(selectedNodeConfig.nodeName);
    } else {
      setName('');
    }
  }, [selectedNodeConfig]);

  return (
    <Modal
      slotProps={{ backdrop: { style: { backdropFilter: 'none' } } }}
      open={canvasRenameNodeId != null}
      onClose={() => setCanvasRenameNodeId(null)}
    >
      <ModalDialog sx={{ width: 600 }}>
        <ModalSection>
          <Typography level="h4">Rename node</Typography>
        </ModalSection>
        <ModalSection>
          <FormControl size="md">
            <FormLabel>Node name</FormLabel>
            <Input
              size="sm"
              placeholder="Enter a name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
        </ModalSection>
        <ModalButtons>
          <Button
            variant="outlined"
            onClick={() => {
              setCanvasRenameNodeId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            color="success"
            onClick={() => {
              setCanvasRenameNodeId(null);
            }}
          >
            Save
          </Button>
        </ModalButtons>
      </ModalDialog>
    </Modal>
  );
}

const ModalSection = styled.div`
  margin-bottom: 10px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export default RenameStartNodeView;
