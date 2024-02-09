import styled from '@emotion/styled';
import { IconButton } from '@mui/joy';

import IconGear from 'icons/IconGear';

type Props = {
  onClick: () => void;
};

function NodeBoxGearButton(props: Props) {
  return (
    <IconButton variant="outlined" onClick={props.onClick}>
      <NodeBoxIconGear />
    </IconButton>
  );
}

const NodeBoxIconGear = styled(IconGear)`
  width: 20px;
  fill: #636b74;
`;

export default NodeBoxGearButton;
