import styled from "@emotion/styled";
import { A, D, F, flow } from "@mobily/ts-belt";
import { Autocomplete, AutocompleteOption, Button } from "@mui/joy";
import { ReactNode, useMemo, useState } from "react";
import { useQuery } from "urql";
import { graphql } from "../../../gql";
import { FlowState, useFlowStore } from "../../store/flowStore";
import PresetSaveModal from "./PresetSaveModal";

const PRESET_SELECTOR_QUERY = graphql(`
  query PresetSelectorQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      space {
        id
        csvEvaluationPresets {
          id
          name
        }
      }
    }
  }
`);

const selector = (state: FlowState) => ({
  spaceId: state.spaceId,
  currentPresetId: state.csvEvaluationCurrentPresetId,
  setCurrentPresetId: state.csvEvaluationSetCurrentPresetId,
  csvEvaluationPresetSetAndLoadPreset: state.csvEvaluationLoadPresetWithId,
  csvEvaluationPresetDelete: state.csvEvaluationDeleteCurrentPreset,
});

export default function PresetSelector() {
  const {
    spaceId,
    currentPresetId,
    setCurrentPresetId,
    csvEvaluationPresetDelete,
  } = useFlowStore(selector);

  const [queryResult] = useQuery({
    query: PRESET_SELECTOR_QUERY,
    variables: {
      spaceId: spaceId,
    },
  });

  const selectedPreset = useMemo(
    () =>
      A.find(
        queryResult.data?.result?.space.csvEvaluationPresets ?? [],
        flow(D.get("id"), F.equals(currentPresetId))
      ),
    [queryResult.data?.result?.space.csvEvaluationPresets, currentPresetId]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

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
            options={queryResult.data?.result?.space.csvEvaluationPresets}
            value={selectedPreset ?? null}
            getOptionLabel={(option) => option.name}
            onChange={(_event, value) => {
              setCurrentPresetId(value?.id ?? null);
            }}
            renderOption={(props, option) => (
              <AutocompleteOption {...props} key={option.id}>
                {option.name}
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
              onClick={() => csvEvaluationPresetDelete()}
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
      <PresetSaveModal
        isModalOpen={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
        preset={selectedPreset}
      />
    </Container>
  );
}

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
