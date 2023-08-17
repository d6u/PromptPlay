import { FragmentType, gql, useFragment } from "../../../__generated__";
import RunButton from "./RunButton";
import "./SubHeader.css";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { useEffect, useRef, useState } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import { useLocation } from "wouter";

const SUB_HEADER_FRAGMENT = gql(`
  fragment SubHeaderFragment on Query {
    workspace(workspaceId: $workspaceId) {
      name
      firstPreset {
        id
        ...RunButtonFragment
      }
    }
  }
`);

const CREATE_PROMPT_BLOCK_MUTATION = gql(`
  mutation CreatePromptBlockMutation($workspaceId: UUID!) {
    createPromptBlock(workspaceId: $workspaceId) {
      id
    }
  }
`);

const CREATE_COMPLETER_BLOCK_MUTATION = gql(`
  mutation CreateCompleterBlock($workspaceId: UUID!) {
    createCompleterBlock(workspaceId: $workspaceId) {
      id
    }
  }
`);

const CREATE_BLOCK_SET_MUTATION = gql(`
  mutation CreateBlockSet($presetId: UUID!) {
    createBlockSet(presetId: $presetId) {
      id
    }
  }
`);

const UPDATE_SPACE_MUTATION = gql(`
  mutation UpdateSpaceMutation(
    $workspaceId: UUID!
    $name: String!
  ) {
    updateSpace(
      id: $workspaceId
      name: $name
    ) {
      id
    }
  }
`);

const DELETE_SPACE_MUTATION = gql(`
  mutation DeleteSpaceMutation($workspaceId: UUID!) {
    deleteSpace(id: $workspaceId) {
      isSuccess
    }
  }
`);

export default function SubHeader({
  workspaceId,
  subHeaderFragment,
}: {
  workspaceId: string;
  subHeaderFragment: FragmentType<typeof SUB_HEADER_FRAGMENT>;
}) {
  const [, setLocation] = useLocation();

  // --- GraphQL ---

  const { workspace } = useFragment(SUB_HEADER_FRAGMENT, subHeaderFragment);

  const [createPromptBlock] = useMutation(CREATE_PROMPT_BLOCK_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });

  const [createCompleterBlock] = useMutation(CREATE_COMPLETER_BLOCK_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });

  const [createBlockSet] = useMutation(CREATE_BLOCK_SET_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });

  const [updateSpace] = useMutation(UPDATE_SPACE_MUTATION, {
    refetchQueries: ["WorkspaceRouteQuery"],
  });
  const [deleteSpace] = useMutation(DELETE_SPACE_MUTATION);

  // --- React ---

  const [isEditingSpaceName, setIsEditingSpaceName] = useState<boolean>(false);
  const [spaceName, setSpaceName] = useState<string>(workspace?.name ?? "");

  useEffect(() => {
    setSpaceName(workspace?.name ?? "");
  }, [workspace?.name]);

  const loadingBarRef = useRef<LoadingBarRef>(null);

  return (
    <header className="SubHeader">
      <LoadingBar
        color="#98ecff"
        ref={loadingBarRef}
        shadow={true}
        waitingTime={100}
      />
      <div className="SubHeader_left">
        <Button
          onClick={() => {
            loadingBarRef.current?.continuousStart();

            createPromptBlock({ variables: { workspaceId } }).then(
              ({ errors, data }) => {
                loadingBarRef.current?.complete();

                if (errors || data?.createPromptBlock?.id == null) {
                  console.error(errors);
                }
              }
            );
          }}
        >
          Create message block
        </Button>
        <Button
          onClick={() => {
            loadingBarRef.current?.continuousStart();

            createCompleterBlock({ variables: { workspaceId } }).then(
              ({ errors, data }) => {
                loadingBarRef.current?.complete();

                if (errors || data?.createCompleterBlock?.id == null) {
                  console.error(errors);
                }
              }
            );
          }}
        >
          Create API block
        </Button>
        <Button
          onClick={() => {
            loadingBarRef.current?.continuousStart();

            createBlockSet({
              variables: {
                presetId: workspace?.firstPreset?.id,
              },
            }).then(({ errors, data }) => {
              loadingBarRef.current?.complete();

              if (errors || data?.createBlockSet?.id == null) {
                console.error(errors);
              }
            });
          }}
        >
          Create block set
        </Button>
        {workspace?.firstPreset && (
          <RunButton
            runButtonFragment={workspace?.firstPreset}
            onLoadingStart={() => {
              loadingBarRef.current?.continuousStart();
            }}
            onLoadingEnd={() => {
              loadingBarRef.current?.complete();
            }}
          />
        )}
      </div>
      <div className="SubHeader_right">
        <div className="SubHeader_space_name_container">
          {isEditingSpaceName ? (
            <>
              <Input
                className="SubHeader_space_name_input"
                value={spaceName}
                onChange={(event) => {
                  setSpaceName(event.target.value);
                }}
                ref={(element) => {
                  if (element == null) {
                    return;
                  }
                  (
                    element.firstElementChild as HTMLInputElement | null
                  )?.focus();
                }}
              />
              <Button
                onClick={() => {
                  setIsEditingSpaceName(false);
                  setSpaceName(workspace?.name ?? "");
                }}
              >
                Cancel
              </Button>
              <Button
                color="success"
                onClick={() => {
                  updateSpace({
                    variables: {
                      workspaceId,
                      name: spaceName,
                    },
                  }).then(({ errors }) => {
                    if (errors != null) {
                      console.error(errors);
                      return;
                    }

                    setIsEditingSpaceName(false);
                  });
                }}
              >
                Save
              </Button>
            </>
          ) : (
            <h2
              className="SubHeader_space_name"
              onClick={() => {
                setIsEditingSpaceName(true);
              }}
            >
              {workspace?.name}
            </h2>
          )}
        </div>
        <Button
          variant="outlined"
          onClick={() => {
            const isConfirmed = window.confirm(
              "⚠️ Unrecoverable action. ⚠️\nDeleting this space is unrecoverable. Are you sure?"
            );
            if (isConfirmed) {
              deleteSpace({
                variables: {
                  workspaceId,
                },
              }).then(({ errors, data }) => {
                if (errors || data?.deleteSpace?.isSuccess !== true) {
                  console.error(errors);
                  return;
                }
                setLocation("/");
              });
            }
          }}
        >
          Delete space
        </Button>
      </div>
    </header>
  );
}
