import styled from "@emotion/styled";
import Textarea from "@mui/joy/Textarea";

const TextareaDisabled = styled(Textarea)`
  &.Mui-focused::before {
    box-shadow: rgb(205, 215, 225) 0px 0px 0px 2px inset;
  }

  & textarea {
    color: #747474;
    cursor: not-allowed;
  }
`;

export default TextareaDisabled;
