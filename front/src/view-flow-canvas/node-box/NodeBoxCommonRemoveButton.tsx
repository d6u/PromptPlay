import styled from '@emotion/styled';
import IconButton from '@mui/joy/IconButton';
import CrossIcon from 'icons/CrossIcon';

type Props = {
  onClick: () => void;
};

function NodeBoxCommonRemoveButton(props: Props) {
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

export default NodeBoxCommonRemoveButton;
