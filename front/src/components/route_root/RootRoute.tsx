import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { useLocation } from "wouter";
import { gql } from "../../__generated__";
import { IS_LOGIN_ENABLED } from "../../constants";
import { placeholderUserTokenState } from "../../state/store";
import Dashboard from "./dashboard/Dashboard";
import "./RootRoute.css";

const ROOT_ROUTE_QUERY = gql(`
  query RootRouteQuery {
    user {
      id
      ...Dashboard
    }
  }
`);

const CREATE_EXAMPLE_SPACE_MUTATION = gql(`
  mutation CreateExampleSpaceMutation {
    createExampleSpace {
      isSuccess
      placeholderClientToken
      space {
        id
      }
    }
  }
`);

export default function RootRoute() {
  const [, setLocation] = useLocation();

  // --- Global State ---

  const setPlaceholderUserToken = useSetRecoilState(placeholderUserTokenState);

  const queryResult = useQuery(ROOT_ROUTE_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const [createExampleSpace] = useMutation(CREATE_EXAMPLE_SPACE_MUTATION, {
    refetchQueries: ["RootRouteQuery"],
  });

  const onClickCreateExamples = useCallback(() => {
    createExampleSpace().then(({ errors, data }) => {
      if (errors) {
        console.error(errors);
        return;
      }
      if (data?.createExampleSpace?.placeholderClientToken == null) {
        return;
      }
      setPlaceholderUserToken(data.createExampleSpace.placeholderClientToken);
      if (data.createExampleSpace.space?.id) {
        setLocation(`/spaces/${data.createExampleSpace.space.id}`);
      }
    });
  }, [createExampleSpace, setLocation, setPlaceholderUserToken]);

  if (queryResult.loading) {
    return <div>Loading...</div>;
  }

  if (queryResult.error != null) {
    return <div>Error! {queryResult.error.message}</div>;
  }

  let content: JSX.Element;

  if (queryResult.data?.user == null) {
    content = (
      <div className="RootRoute_empty_state_container">
        <button
          className="RootRoute_big_button RootRoute_big_button_create_example"
          onClick={onClickCreateExamples}
        >
          Create an example space
        </button>
        {IS_LOGIN_ENABLED && (
          <button className="RootRoute_big_button">Sign up / Login</button>
        )}
      </div>
    );
  } else {
    content = <Dashboard dashboardFragment={queryResult.data.user} />;
  }

  return <div className="RootRoute">{content}</div>;
}
