import styled from '@emotion/styled';
import {
  Autocomplete,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import ReadonlyInput from 'generic-components/ReadonlyInput';
import PlusIcon from 'icons/PlusIcon';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  readonly: boolean;
  variableId: string;
  value: { globalVariableId: string | null };
  onChange: (value: { globalVariableId: string | null }) => void;
};

function NodeVariableGlobalVariableSelectorRow(props: Props) {
  const { control, handleSubmit } = useForm<{
    globalVariableId: string | null;
  }>({ values: props.value });

  const onChange = useMemo(() => {
    return handleSubmit(props.onChange);
  }, [handleSubmit, props]);

  const globalVariables = useFlowStore(
    (s) => s.canvas.flowContent.globalVariables,
  );

  const createGlobalVariable = useFlowStore((s) => s.createGlobalVariable);

  const [modalOpen, setModalOpen] = useState(false);
  const [globalVariableName, setGlobalVariableName] = useState('');

  if (props.readonly) {
    return (
      <Container>
        <ReadonlyInput
          value={
            props.value.globalVariableId != null
              ? globalVariables[props.value.globalVariableId].name
              : undefined
          }
        />
      </Container>
    );
  }

  return (
    <Container>
      <Controller
        control={control}
        name="globalVariableId"
        render={({ field }) => (
          <StyledAutocomplete
            size="sm"
            options={Object.keys(globalVariables)}
            getOptionLabel={(option) => globalVariables[option as string].name}
            {...field}
            onChange={(_, newValue) => {
              field.onChange(newValue);
              onChange();
            }}
          />
        )}
      />
      <IconButton onClick={() => setModalOpen(true)}>
        <StyledPlusIcon />
      </IconButton>
      <Modal
        slotProps={{ backdrop: { style: { backdropFilter: 'none' } } }}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <ModalDialog sx={{ width: 600 }}>
          <ModalSection>
            <Typography level="h4">Create new global variable</Typography>
          </ModalSection>
          <ModalSection>
            <FormControl size="md">
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter a name"
                value={globalVariableName}
                onChange={(e) => setGlobalVariableName(e.target.value)}
              />
            </FormControl>
          </ModalSection>
          <ModalButtons>
            <Button
              variant="outlined"
              onClick={() => {
                setModalOpen(false);
                // Restore name to the original value when closing modal
                setGlobalVariableName('');
              }}
            >
              Cancel
            </Button>
            <Button
              color="success"
              onClick={() => {
                if (
                  Object.values(globalVariables).find(
                    (globalVariable) =>
                      globalVariable.name === globalVariableName,
                  )
                ) {
                  // TODO: Use a proper alert component
                  alert('Name already exists');
                } else {
                  setModalOpen(false);
                  createGlobalVariable(globalVariableName, props.variableId);
                  setGlobalVariableName('');
                }
              }}
            >
              Create
            </Button>
          </ModalButtons>
        </ModalDialog>
      </Modal>
    </Container>
  );
}

const Container = styled.div`
  margin-top: 5px;
  display: flex;
  gap: 5px;
`;

const StyledAutocomplete = styled(Autocomplete)`
  flex-grow: 1;
  // "width: 0" is required for input to work properly with
  // "flow-shrink: 1" (default for flex items), because browser gives input
  // a default width (https://arc.net/l/quote/zbdbssje)
  //
  // But it's a question whether this is a good place to put this, because
  // MUI's Input component wraps the actual input in a div, so this width
  // doesn't apply to the actual input element. Right now it seems to work.
  width: 0;
`;

const StyledPlusIcon = styled(PlusIcon)`
  width: 16px;
  fill: #666666;
`;

const ModalSection = styled.div`
  margin-bottom: 10px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export default NodeVariableGlobalVariableSelectorRow;
