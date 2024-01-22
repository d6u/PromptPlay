import styled from '@emotion/styled';
import { A } from '@mobily/ts-belt';
import { Autocomplete, AutocompleteOption, Button } from '@mui/joy';
import { ReactNode, useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { graphql } from '../../../../gql';
import { useFlowStore } from '../../store/FlowStoreContext';
import PresetSaveModal from './PresetSaveModal';

export default function PresetSelector() {
  // SECTION: Select state from store

  const spaceId = useFlowStore((s) => s.spaceId);
  const selectedPresetId = useFlowStore((s) => s.csvModeSelectedPresetId);
  const selectAndLoadPreset = useFlowStore((s) => s.selectAndLoadPreset);
  const unselectPreset = useFlowStore((s) => s.unselectPreset);
  const deleteAndUnselectPreset = useFlowStore(
    (s) => s.deleteAndUnselectPreset,
  );

  // !SECTION

  const [query] = useQuery({
    query: graphql(`
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
    `),
    variables: { spaceId },
  });

  const selectedPreset = useMemo(() => {
    const presets = query.data?.result?.space.csvEvaluationPresets ?? [];
    return A.find(presets, (p) => p.id === selectedPresetId);
  }, [query.data?.result?.space.csvEvaluationPresets, selectedPresetId]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  let content: ReactNode | null = null;

  if (query.fetching) {
    content = null;
  } else if (query.error || !query.data?.result) {
    content = null;
  } else {
    content = (
      <>
        <Autocomplete
          size="sm"
          openOnFocus
          placeholder="Your preset"
          sx={{ width: 400 }}
          options={query.data?.result?.space.csvEvaluationPresets}
          value={selectedPreset ?? null}
          getOptionLabel={(option) => option.name}
          onChange={(_event, value) => {
            if (value?.id != null) {
              selectAndLoadPreset(value.id);
            } else {
              unselectPreset();
            }
          }}
          renderOption={(props, option) => (
            <AutocompleteOption {...props} key={option.id}>
              {option.name}
            </AutocompleteOption>
          )}
        />
        <Button variant="outlined" onClick={() => setIsModalOpen(true)}>
          Save...
        </Button>
        {selectedPreset && (
          <Button
            variant="outlined"
            onClick={() => {
              const comfirmed = confirm('Deleted preset cannot be restored');
              if (comfirmed) {
                deleteAndUnselectPreset();
              }
            }}
          >
            Delete preset
          </Button>
        )}
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

// ANCHOR: UI Components

const Container = styled.div`
  display: flex;
  gap: 10px;
`;
