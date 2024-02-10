import styled from '@emotion/styled';
import { Input } from '@mui/joy';
import { Control, Controller, FieldArrayWithId } from 'react-hook-form';

import ReadonlyInput from 'components/generic/ReadonlyInput';
import RemoveButton from 'components/generic/RemoveButton';

import { FieldValues } from './types';

type Props = {
  isReadOnly: boolean;
  control: Control<FieldValues>;
  formField: FieldArrayWithId<FieldValues, 'list', 'id'>;
  index: number;
  onUpdate: () => void;
  onRemove: () => void;
};

function NodeConnectorEditor(props: Props) {
  if (props.isReadOnly) {
    return <ReadonlyInput value={props.formField.value} />;
  }

  return (
    <>
      <Controller
        control={props.control}
        name={`list.${props.index}.value`}
        render={({ field }) => (
          <StyledInput
            {...field}
            color="primary"
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                props.onUpdate();
              }
            }}
            onBlur={() => {
              field.onBlur();
              props.onUpdate();
            }}
          />
        )}
      />
      <RemoveButton onClick={props.onRemove} />
    </>
  );
}

// NOTE: Requires parent to have `display: flex`
const StyledInput = styled(Input)`
  flex-grow: 1;
`;

export default NodeConnectorEditor;
