import styled from "@emotion/styled";
import { Autocomplete, AutocompleteOption, Button } from "@mui/joy";
import { ReactNode, useEffect, useMemo } from "react";
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
          <Button
            variant="outlined"
            onClick={() => {
              if (selectedPreset) {
                csvEvaluationPresetSetSave();
              } else {
                // TODO
              }
            }}
          >
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

  return <Container>{content}</Container>;
}
