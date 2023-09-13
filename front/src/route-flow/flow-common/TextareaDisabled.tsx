import styled from "@emotion/styled";
import Textarea from "@mui/joy/Textarea";

const CustomizedTextarea = styled(Textarea)`
  &.Mui-focused::before {
    box-shadow: rgb(205, 215, 225) 0px 0px 0px 2px inset;
  }

  & textarea {
    color: #747474;
    cursor: not-allowed;
  }
`;

type Props = React.ComponentProps<typeof CustomizedTextarea> & {
  isCode?: boolean;
};

export default function TextareaDisabled(props: Props) {
  const attrs = props.isCode
    ? { sx: { fontFamily: "var(--mono-font-family)" } }
    : {};

  return <CustomizedTextarea {...attrs} {...props} />;
}
