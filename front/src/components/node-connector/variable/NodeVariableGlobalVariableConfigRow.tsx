import styled from '@emotion/styled';
import { Autocomplete, IconButton } from '@mui/joy';
import { Control, Controller, FieldArrayWithId } from 'react-hook-form';

import ReadonlyInput from 'generic-components/ReadonlyInput';
import PlusIcon from 'icons/PlusIcon';
import { useFlowStore } from 'state-flow/flow-store';

import { VariableFormValue } from '../types';

type Props = {
  isNodeReadOnly: boolean;
  control: Control<VariableFormValue>;
  formField: FieldArrayWithId<VariableFormValue, 'list', 'id'>;
  index: number;
  onUpdateTrigger: () => void;
};

function NodeVariableGlobalVariableConfigRow(props: Props) {
  const globalVariables = useFlowStore(
    (s) => s.canvas.flowContent.globalVariables,
  );

  const createGlobalVariable = useFlowStore((s) => s.createGlobalVariable);

  if (props.isNodeReadOnly) {
    return (
      <Container>
        <ReadonlyInput
          value={
            props.formField.globalVariableId != null
              ? globalVariables[props.formField.globalVariableId].name
              : undefined
          }
        />
      </Container>
    );
  }

  return (
    <Container>
      <Controller
        control={props.control}
        name={`list.${props.index}.globalVariableId`}
        render={({ field }) => (
          <StyledAutocomplete
            size="sm"
            options={Object.keys(globalVariables)}
            getOptionLabel={(option) => globalVariables[option as string].name}
            value={field.value}
            onChange={(_, newValue) => {
              field.onChange(newValue);
              props.onUpdateTrigger();
            }}
          />
        )}
      />
      <IconButton
        onClick={() => {
          createGlobalVariable('New Variable');
        }}
      >
        <StyledPlusIcon />
      </IconButton>
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
`;

const StyledPlusIcon = styled(PlusIcon)`
  width: 16px;
  fill: #666666;
`;

export default NodeVariableGlobalVariableConfigRow;
