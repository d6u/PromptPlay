import styled from "@emotion/styled";
import IconButton from "@mui/joy/IconButton";
import CrossIcon from "../../../components/icons/CrossIcon";

const StyledCloseIcon = styled(CrossIcon)`
  width: 15px;
  fill: #c41c1c;
`;

export default function RemoveButton(props: { onClick: () => void }) {
  return (
    <IconButton
      color="danger"
      size="sm"
      variant="plain"
      onClick={props.onClick}
    >
      <StyledCloseIcon />
    </IconButton>
  );
}
