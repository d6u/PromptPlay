import styled from '@emotion/styled';
import { Input } from '@mui/joy';
import { useForm } from 'react-hook-form';

import ReadonlyInput from 'generic-components/ReadonlyInput';

import { useMemo } from 'react';

type Props = {
  readonly: boolean;
  value: { name: string };
  onChange: (value: { name: string }) => void;
};

function NodeRenamableVariableNameInput(props: Props) {
  const { register, handleSubmit } = useForm<{ name: string }>({
    values: props.value,
  });

  const onChange = useMemo(() => {
    return handleSubmit(props.onChange);
  }, [handleSubmit, props]);

  if (props.readonly) {
    return <ReadonlyInput value={props.value.name} />;
  }

  return (
    <StyledInput
      color="primary"
      {...register('name', { onBlur: onChange })}
      onKeyUp={(e) => {
        if (e.key === 'Enter') {
          onChange();
        }
      }}
    />
  );
}

// NOTE: Requires parent to have `display: flex`
const StyledInput = styled(Input)`
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

export default NodeRenamableVariableNameInput;
