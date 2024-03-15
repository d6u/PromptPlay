import styled from '@emotion/styled';
import { Autocomplete, IconButton } from '@mui/joy';

import PlusIcon from 'icons/PlusIcon';

function NodeVariableGlobalVariableConfigRow() {
  return (
    <Container>
      <StyledAutocomplete size="sm" options={['Option 1', 'Option 2']} />
      <IconButton>
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
