import styled from "@emotion/styled";
import {
  Autocomplete,
  AutocompleteOption,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useQuery } from "urql";
import { SPACE_CSV_EVALUATION_PRESETS_QUERY } from "../store/flowGraphql";
import { FlowState, useFlowStore } from "../store/flowStore";

const Container = styled.div`
  height: 49px;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
  display: flex;
  gap: 10px;
  justify-content: space-between;
`;

const LeftAlign = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const RightAlign = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalSection = styled.div`
  margin-bottom: 10px;
`;

type Preset = {
  id: string;
  label: string;
};

const selector = (state: FlowState) => ({
  spaceId: state.spaceId,
  csvEvaluationPresetId: state.csvEvaluationPresetId,
  csvEvaluationPresetSetAndLoadPreset:
    state.csvEvaluationPresetSetAndLoadPreset,
  csvEvaluationPresetSetSave: state.csvEvaluationPresetSetSave,
});

export default function EvaluationModePresetSelector() {
  const {
    spaceId,
    csvEvaluationPresetId,
    csvEvaluationPresetSetAndLoadPreset,
    csvEvaluationPresetSetSave,
  } = useFlowStore(selector);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [queryResult] = useQuery({
    query: SPACE_CSV_EVALUATION_PRESETS_QUERY,
    variables: {
      spaceId: spaceId,
    },
  });

  const presets = useMemo<Preset[]>(
    () =>
      queryResult.data?.result?.space.csvEvaluationPresets.map((preset) => ({
        id: preset.id,
        label: preset.name,
      })) ?? [],
    [queryResult.data?.result?.space.csvEvaluationPresets]
  );

  useEffect(() => {
    if (!presets.find((preset) => preset.id === csvEvaluationPresetId)) {
      csvEvaluationPresetSetAndLoadPreset(null);
    }
  }, [csvEvaluationPresetId, csvEvaluationPresetSetAndLoadPreset, presets]);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === csvEvaluationPresetId) ?? null,
    [presets, csvEvaluationPresetId]
  );

  let content: ReactNode | null = null;

  if (queryResult.fetching) {
    content = null;
  } else if (queryResult.error || !queryResult.data?.result) {
    content = null;
  } else {
    content = (
      <>
        <LeftAlign>
          <Autocomplete
            size="sm"
            openOnFocus
            placeholder="Your preset"
            sx={{ width: 400 }}
            options={presets}
            value={selectedPreset}
            onChange={(e, value) => {
              csvEvaluationPresetSetAndLoadPreset(value?.id ?? null);
            }}
            renderOption={(props, option) => (
              <AutocompleteOption {...props} key={option.id}>
                {option.label}
              </AutocompleteOption>
            )}
          />
          <Button variant="outlined" onClick={() => setIsModalOpen(true)}>
            Save
          </Button>
        </LeftAlign>
        <RightAlign>
          {selectedPreset && (
            <Button
              variant="outlined"
              onClick={() => {
                if (selectedPreset) {
                  // TODO
                }
              }}
            >
              Delete preset
            </Button>
          )}
        </RightAlign>
      </>
    );
  }

  return (
    <Container>
      {content}
      <Modal
        slotProps={{ backdrop: { style: { backdropFilter: "none" } } }}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <ModalDialog sx={{ width: 600 }}>
          <ModalSection>
            <Typography level="h4">
              {selectedPreset
                ? `Update "${selectedPreset?.label}" preset`
                : "Save preset"}
            </Typography>
          </ModalSection>
          <ModalSection>
            <FormControl size="md">
              <FormLabel>Name</FormLabel>
              <Input
                size="sm"
                placeholder="Enter a name"
                value={selectedPreset?.label}
              />
            </FormControl>
          </ModalSection>
          <ModalButtons>
            <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            {selectedPreset ? (
              <>
                <Button variant="outlined">Save as new</Button>
                <Button color="success">Update</Button>
              </>
            ) : (
              <Button color="success">Save</Button>
            )}
          </ModalButtons>
        </ModalDialog>
      </Modal>
    </Container>
  );
}
