// Replace `{xyz}` but ignore `{{zyx}}`
// If `xyz` doesn't exist on values, null will be provided.
export default function replacePlaceholders(
  str: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: { [key: string]: any }
) {
  const regex = /(?<!\{)\{([^{}]+)\}(?!\})/g;
  return str
    .replace(regex, (_, p1) => {
      return values[p1] !== undefined ? values[p1] : null;
    })
    .replace("{{", "{")
    .replace("}}", "}");
}
