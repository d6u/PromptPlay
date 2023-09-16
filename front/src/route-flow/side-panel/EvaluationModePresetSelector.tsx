import styled from "@emotion/styled";
import { Autocomplete, AutocompleteOption, Button } from "@mui/joy";
import { nanoid } from "nanoid";
import { useMemo, useState } from "react";

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

type Prest = {
  id: string;
  label: string;
};

export default function EvaluationModePresetSelector() {
  const [presets, setPresets] = useState<readonly Prest[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? null,
    [presets, selectedPresetId]
  );

  return (
    <Container>
      <LeftAlign>
        <Autocomplete
          size="sm"
          openOnFocus
          placeholder="Your preset"
          sx={{ width: 400 }}
          options={presets}
          value={selectedPreset}
          onChange={(e, value) => {
            setSelectedPresetId(value?.id ?? null);
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
            const preset = {
              label: "New preset",
              id: nanoid(),
            };
            setPresets([...presets, preset]);
            setSelectedPresetId(preset.id);
          }}
        >
          Save
        </Button>
      </LeftAlign>
      <RightAlign>
        <Button
          variant="outlined"
          onClick={() => {
            const newPresets = presets.filter(
              (option) => option.id !== selectedPresetId
            );
            setPresets(newPresets);
            setSelectedPresetId(newPresets.length ? newPresets[0].id : null);
          }}
        >
          Delete preset
        </Button>
      </RightAlign>
    </Container>
  );
}
