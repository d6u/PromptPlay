import styled from '@emotion/styled';
import IconButton from '@mui/joy/IconButton';

import GlobeIcon from 'icons/GlobeIcon';

type Props = {
  disabled?: boolean;
  isActive: boolean;
  onClick: () => void;
};

function NodeVariableToggleIsGlobalButton(props: Props) {
  return (
    <IconButton
      color={props.isActive ? 'primary' : 'neutral'}
      disabled={props.disabled}
      variant={props.isActive ? 'solid' : 'plain'}
      onClick={props.onClick}
      sx={(theme) => ({
        '&:disabled': {
          background: theme.vars.palette.primary.solidBg,
        },
      })}
    >
      <StyledGlobeIcon style={{ fill: props.isActive ? 'white' : undefined }} />
    </IconButton>
  );
}

const StyledGlobeIcon = styled(GlobeIcon)`
  width: 15px;
  fill: #666666;
`;

export default NodeVariableToggleIsGlobalButton;
