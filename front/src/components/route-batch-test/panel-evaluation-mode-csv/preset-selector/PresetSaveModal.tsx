import styled from '@emotion/styled';
import { Option } from '@mobily/ts-belt';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy';
import { useEffect, useState } from 'react';
import { useFlowStore } from '../../../route-flow/store/FlowStoreContext';

type Props = {
  isModalOpen: boolean;
  onCloseModal: () => void;
  preset: Option<{ name: string }>;
};

export default function PresetSaveModal(props: Props) {
  // SECTION: Select state from store
  const createAndSelectPreset = useFlowStore((s) => s.createAndSelectPreset);
  const updateSelectedPreset = useFlowStore((s) => s.updateSelectedPreset);
  // !SECTION

  const [name, setName] = useState(() => props.preset?.name ?? '');

  useEffect(() => {
    setName(props.preset?.name ?? '');
  }, [props.preset?.name]);

  return (
    <Modal
      slotProps={{ backdrop: { style: { backdropFilter: 'none' } } }}
      open={props.isModalOpen}
      onClose={() => props.onCloseModal()}
    >
      <ModalDialog sx={{ width: 600 }}>
        <ModalSection>
          <Typography level="h4">
            {props.preset
              ? `Update "${props.preset.name}" preset`
              : 'Save preset'}
          </Typography>
        </ModalSection>
        <ModalSection>
          <FormControl size="md">
            <FormLabel>Name</FormLabel>
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
              props.onCloseModal();
              // Restore name to the original value when closing modal
              setName(props.preset?.name ?? '');
            }}
          >
            Cancel
          </Button>
          {props.preset ? (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  props.onCloseModal();
                  createAndSelectPreset({ name });
                }}
              >
                Save as new
              </Button>
              <Button
                color="success"
                onClick={() => {
                  props.onCloseModal();
                  updateSelectedPreset({ name });
                }}
              >
                Update
              </Button>
            </>
          ) : (
            <Button
              color="success"
              onClick={() => {
                props.onCloseModal();
                createAndSelectPreset({ name });
              }}
            >
              Save
            </Button>
          )}
        </ModalButtons>
      </ModalDialog>
    </Modal>
  );
}

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalSection = styled.div`
  margin-bottom: 10px;
`;
