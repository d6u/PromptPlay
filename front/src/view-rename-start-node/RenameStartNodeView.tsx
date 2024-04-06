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
import { useEffect, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';

import { NodeClass } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

function RenameStartNodeView() {
  const canvasRenameNodeId = useFlowStore((s) => s.canvasRenameNodeId);
  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);
  const setCanvasRenameNodeId = useFlowStore((s) => s.setCanvasRenameNodeId);
  const updateNodeConfig = useFlowStore((s) => s.updateNodeConfig);

  const selectedNodeConfig = useMemo(() => {
    if (canvasRenameNodeId == null) {
      return null;
    }
    const nodeConfig = nodeConfigs[canvasRenameNodeId];
    invariant(
      nodeConfig.class === NodeClass.Start,
      'Node class should be Start',
    );
    return nodeConfig;
  }, [canvasRenameNodeId, nodeConfigs]);

  const [name, setName] = useState('');

  useEffect(() => {
    if (selectedNodeConfig) {
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
              invariant(canvasRenameNodeId != null, 'Node id is not null');
              updateNodeConfig(canvasRenameNodeId, { nodeName: name });
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
