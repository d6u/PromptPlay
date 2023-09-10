import styled from "@emotion/styled";
import Input from "@mui/joy/Input";

const InputDisabled = styled(Input)`
  flex-grow: 1;

  &.Mui-focused::before {
    box-shadow: rgb(205, 215, 225) 0px 0px 0px 2px inset;
  }

  & input {
    color: #747474;
    cursor: not-allowed;
  }
`;

export default InputDisabled;
