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
import { useCallback, useEffect, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';

import { NodeKind } from 'flow-models';

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
    invariant(nodeConfig.kind === NodeKind.Start, 'Node kind should be Start');
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

  const onSave = useCallback(() => {
    setCanvasRenameNodeId(null);
    invariant(canvasRenameNodeId != null, 'Node id is not null');
    updateNodeConfig(canvasRenameNodeId, { nodeName: name });
  }, [canvasRenameNodeId, name, setCanvasRenameNodeId, updateNodeConfig]);

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSave();
                }
              }}
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
          <Button color="success" onClick={() => onSave()}>
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
