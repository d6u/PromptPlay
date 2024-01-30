import styled from '@emotion/styled';
import IconButton from '@mui/joy/IconButton';
import CrossIcon from '../../icons/CrossIcon';

export default function NodeBoxCommonRemoveButton(props: {
  onClick: () => void;
}) {
  return (
    <IconButton color="danger" onClick={props.onClick}>
      <StyledCloseIcon />
    </IconButton>
  );
}

const StyledCloseIcon = styled(CrossIcon)`
  width: 15px;
  fill: #c41c1c;
`;
