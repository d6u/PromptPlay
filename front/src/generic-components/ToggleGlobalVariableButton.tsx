import styled from '@emotion/styled';
import IconButton from '@mui/joy/IconButton';

import GlobeIcon from 'icons/GlobeIcon';

type Props = {
  disabled?: boolean;
  isActive: boolean;
  onClick: () => void;
};

function ToggleGlobalVariableButton(props: Props) {
  return (
    <IconButton
      color="neutral"
      disabled={props.disabled}
      variant={props.isActive ? 'soft' : 'plain'}
      onClick={props.onClick}
    >
      <StyledGlobeIcon />
    </IconButton>
  );
}

const StyledGlobeIcon = styled(GlobeIcon)`
  width: 15px;
  fill: #666666;
`;

export default ToggleGlobalVariableButton;
