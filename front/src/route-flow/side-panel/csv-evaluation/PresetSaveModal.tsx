import styled from "@emotion/styled";
import {
  Modal,
  ModalDialog,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { FlowState, useFlowStore } from "../../store/flowStore";
import { Preset } from "./PresetSelector";

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalSection = styled.div`
  margin-bottom: 10px;
`;

const selector = (state: FlowState) => ({
  csvEvaluationPresetCreate: state.csvEvaluationPresetCreate,
  csvEvaluationPresetUpdate: state.csvEvaluationPresetUpdate,
});

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  selectedPreset: Preset | null;
};

export default function PresetSaveModal(props: Props) {
  const { csvEvaluationPresetCreate, csvEvaluationPresetUpdate } =
    useFlowStore(selector);

  const [name, setName] = useState(props.selectedPreset?.label ?? "");

  useEffect(() => {
    setName(props.selectedPreset?.label ?? "");
  }, [props.selectedPreset]);

  return (
    <Modal
      slotProps={{ backdrop: { style: { backdropFilter: "none" } } }}
      open={props.isModalOpen}
      onClose={() => props.setIsModalOpen(false)}
    >
      <ModalDialog sx={{ width: 600 }}>
        <ModalSection>
          <Typography level="h4">
            {props.selectedPreset ? `Update "${name}" preset` : "Save preset"}
          </Typography>
        </ModalSection>
        <ModalSection>
          <FormControl size="md">
            <FormLabel>Name</FormLabel>
            <Input
              size="sm"
              placeholder="Enter a name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </FormControl>
        </ModalSection>
        <ModalButtons>
          <Button
            variant="outlined"
            onClick={() => props.setIsModalOpen(false)}
          >
            Cancel
          </Button>
          {props.selectedPreset ? (
            <>
              <Button variant="outlined">Save as new</Button>
              <Button color="success">Update</Button>
            </>
          ) : (
            <Button
              color="success"
              onClick={() => {
                csvEvaluationPresetCreate(name).then(() => {
                  props.setIsModalOpen(false);
                });
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
