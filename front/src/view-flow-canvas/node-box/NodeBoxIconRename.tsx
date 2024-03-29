import styled from '@emotion/styled';
import { IconButton } from '@mui/joy';
import IconEdit from 'icons/IconEdit';

type Props = {
  onClick: () => void;
};

function NodeBoxIconRename(props: Props) {
  return (
    <IconButton variant="outlined" onClick={props.onClick}>
      <NodeBoxIconGear />
    </IconButton>
  );
}

const NodeBoxIconGear = styled(IconEdit)`
  width: 20px;
  fill: #636b74;
`;

export default NodeBoxIconRename;
