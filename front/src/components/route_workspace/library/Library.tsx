import { useSetRecoilState } from "recoil";
import { FragmentType, gql, useFragment } from "../../../__generated__";
import {
  EditorElementType,
  selectedBlockState,
  selectedElementTypeState,
} from "../../../state/store";
import LibraryBlock from "../../blocks/LibraryBlock";
import "./Library.css";

const LIBRARY_FRAGMENT = gql(`
  fragment Library on Workspace {
    blocks {
      id
      __typename
      ...LibraryBlock
    }
  }
`);

export default function Library({
  libraryFragment,
}: {
  libraryFragment: FragmentType<typeof LIBRARY_FRAGMENT>;
}) {
  const setSelectedElementTypeState = useSetRecoilState(
    selectedElementTypeState
  );
  const setSelectedBlockState = useSetRecoilState(selectedBlockState);

  const library = useFragment(LIBRARY_FRAGMENT, libraryFragment);

  return (
    <div className="Library">
      <div className="Library_inner">
        {library.blocks.map((block) => (
          <LibraryBlock
            key={block.id}
            className="Library_block"
            libraryBlockFragment={block}
            onClick={() => {
              setSelectedElementTypeState(
                block.__typename === "PromptBlock"
                  ? EditorElementType.Prompt
                  : EditorElementType.Completer
              );
              setSelectedBlockState(block.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
