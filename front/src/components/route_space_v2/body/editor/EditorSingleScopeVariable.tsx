import {
  spaceContentState,
  spaceV2SelectedBlockSelector,
} from "../../../../state/store";
import { SpaceContent } from "../../../../static/spaceTypes";
import { UPDATE_SPACE_V2_MUTATION } from "../../graphql";
import { useMutation } from "@apollo/client";
import Input from "@mui/joy/Input";
import { useState } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import u from "updeep";

type Props = {
  spaceId: string;
  isOutput?: boolean;
};

export default function EditorSingleScopeVariable(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const block = useRecoilValue(spaceV2SelectedBlockSelector)!;

  const [scopeName, setScopeName] = useState<string>(
    ((props.isOutput ? block.output : block.input) as string) ?? ""
  );

  const updateOutputScopeName = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        let spaceContent = await snapshot.getPromise(spaceContentState);

        if (spaceContent == null) {
          console.error("spaceContent should not be null");
          return;
        }

        spaceContent = u<any, SpaceContent>(
          {
            components: {
              [block.id]: {
                [props.isOutput ? "output" : "input"]: scopeName,
              },
            },
          },
          spaceContent
        );

        updateSpaceV2({
          variables: {
            spaceId: props.spaceId,
            content: JSON.stringify(spaceContent),
          },
        });
      },
    [block.id, props.isOutput, props.spaceId, scopeName, updateSpaceV2]
  );

  return (
    <Input
      color="neutral"
      size="sm"
      variant="soft"
      style={{ flexGrow: 1 }}
      value={scopeName}
      onChange={(e) => {
        setScopeName(e.target.value);
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          updateOutputScopeName();
        }
      }}
      onBlur={updateOutputScopeName}
    />
  );
}
