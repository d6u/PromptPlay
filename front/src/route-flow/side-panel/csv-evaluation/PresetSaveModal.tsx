import styled from "@emotion/styled";
import { Option } from "@mobily/ts-belt";
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

const selector = (state: FlowState) => ({
  setCurrentPresetId: state.csvEvaluationSetCurrentPresetId,
  saveNewPreset: state.csvEvaluationSaveNewPreset,
  csvEvaluationPresetUpdate: state.csvEvaluationPresetUpdate,
});

type Props = {
  isModalOpen: boolean;
  onCloseModal: () => void;
  preset: Option<{ name: string }>;
};

export default function PresetSaveModal(props: Props) {
  const {
    setCurrentPresetId,
    saveNewPreset,
    // csvEvaluationPresetUpdate,
  } = useFlowStore(selector);

  const [name, setName] = useState(props.preset?.name ?? "");

  useEffect(() => {
    setName(props.preset?.name ?? "");
  }, [props.preset?.name]);

  return (
    <Modal
      slotProps={{ backdrop: { style: { backdropFilter: "none" } } }}
      open={props.isModalOpen}
      onClose={() => props.onCloseModal()}
    >
      <ModalDialog sx={{ width: 600 }}>
        <ModalSection>
          <Typography level="h4">
            {props.preset
              ? `Update "${props.preset.name}" preset`
              : "Save preset"}
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
              setName(props.preset?.name ?? "");
            }}
          >
            Cancel
          </Button>
          {props.preset ? (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  saveNewPreset({ name }).then((data) => {
                    // TODO: handle error
                    if (data?.id) {
                      props.onCloseModal();
                      setCurrentPresetId(data.id);
                    }
                  });
                }}
              >
                Save as new
              </Button>
              <Button color="success">Update</Button>
            </>
          ) : (
            <Button
              color="success"
              onClick={() => {
                saveNewPreset({ name }).then((data) => {
                  // TODO: handle error
                  if (data?.id) {
                    props.onCloseModal();
                    setCurrentPresetId(data.id);
                  }
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

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalSection = styled.div`
  margin-bottom: 10px;
`;
