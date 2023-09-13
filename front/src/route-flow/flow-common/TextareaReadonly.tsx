import Textarea from "@mui/joy/Textarea";

type Props = React.ComponentProps<typeof Textarea> & {
  isCode?: boolean;
};

export default function TextareaReadonly(props: Props) {
  const { isCode, ...rest } = props;

  return (
    <Textarea
      sx={{
        "--Textarea-focusedHighlight": "rgb(205, 215, 225)",
        "--Textarea-focusedThickness": "1px",
        fontFamily: isCode ? "var(--font-family-mono)" : undefined,
        color: "#747474",
      }}
      slotProps={{
        textarea: {
          sx: {
            cursor: "not-allowed",
          },
        },
      }}
      {...rest}
    />
  );
}
