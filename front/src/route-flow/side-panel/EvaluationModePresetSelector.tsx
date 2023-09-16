import styled from "@emotion/styled";
import { A, D } from "@mobily/ts-belt";
import { Autocomplete, AutocompleteOption, Button, Input } from "@mui/joy";
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
  const [isEditingPresentName, setIsEditingPresentName] =
    useState<boolean>(false);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? null,
    [presets, selectedPresetId]
  );

  return (
    <Container>
      <LeftAlign>
        <Button
          color="primary"
          variant="solid"
          onClick={() => {
            const preset = {
              label: "New preset",
              id: nanoid(),
            };
            setPresets([...presets, preset]);
            setSelectedPresetId(preset.id);
          }}
        >
          New preset
        </Button>
        {isEditingPresentName ? (
          <Input
            sx={{ width: 400 }}
            value={selectedPreset?.label}
            onChange={(e) => {
              const newLabel = e.target.value;

              const selectedPresetIndex = presets.findIndex(
                (preset) => preset.id === selectedPresetId
              );

              setPresets((prev) =>
                A.updateAt(prev, selectedPresetIndex, D.set("label", newLabel))
              );
            }}
          />
        ) : (
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
        )}
        {selectedPresetId != null &&
          (isEditingPresentName ? (
            <>
              <Button
                variant="solid"
                color="success"
                onClick={() => setIsEditingPresentName(false)}
              >
                Confirm
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsEditingPresentName(false)}
              >
                Canel
              </Button>
            </>
          ) : (
            selectedPresetId != null && (
              <Button
                variant="outlined"
                onClick={() => setIsEditingPresentName(true)}
              >
                Rename
              </Button>
            )
          ))}
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
