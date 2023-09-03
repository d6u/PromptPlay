import { FragmentType, gql, useFragment } from "../../__generated__";
import Library from "./library/Library";
import Simulator from "./simulator/Simulator";

const WORKSPACE_CONTENT_FRAGMENT = gql(`
  fragment WorkspaceContent on Query {
    workspace(workspaceId: $workspaceId) {
      id
      ...Library
      firstPreset {
        id
        ...Simulator
      }
    }
  }
`);

export default function WorkspaceContent({
  workspaceContentFragment,
}: {
  workspaceContentFragment: FragmentType<typeof WORKSPACE_CONTENT_FRAGMENT>;
}) {
  const workspaceContent = useFragment(
    WORKSPACE_CONTENT_FRAGMENT,
    workspaceContentFragment
  );

  return (
    <>
      {workspaceContent.workspace && (
        <Library libraryFragment={workspaceContent.workspace} />
      )}
      <div className="Border"></div>
      {workspaceContent.workspace?.firstPreset && (
        <Simulator simulatorFragment={workspaceContent.workspace.firstPreset} />
      )}
    </>
  );
}
