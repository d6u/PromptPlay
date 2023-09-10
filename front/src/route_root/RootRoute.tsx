import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { useMutation, useQuery } from "urql";
import { IS_LOGIN_ENABLED } from "../constants";
import { graphql } from "../gql";
import { useLocalStorageStore } from "../state/appState";
import { LOGIN_PATH, pathToSpace } from "../static/routeConfigs";
import Dashboard from "./dashboard/Dashboard";
import { ROOT_ROUTE_QUERY } from "./queries";

const CREATE_PLACEHOLDER_USER_AND_EXAMPLE_SPACE_MUTATION = graphql(`
  mutation CreatePlaceholderUserAndExampleSpaceMutation {
    result: createPlaceholderUserAndExampleSpace {
      placeholderClientToken
      space {
        id
      }
    }
  }
`);

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyStateContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;

  @media only screen and (max-width: 500px) {
    padding: 15px;
    gap: 15px;
  }
`;

const BigButton = styled.button<{ $createExample?: boolean }>`
  aspect-ratio: 1 / 1;
  width: 200px;
  border: 1px solid black;
  padding: 20px;
  background: none;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  ${(props) =>
    props.$createExample
      ? css`
          border: none;
          background: #318a09;
          color: white;
        `
      : null}
`;

export default function RootRoute() {
  const navigate = useNavigate();

  // --- Global State ---

  const setPlaceholderUserToken = useLocalStorageStore(
    (state) => state.setPlaceholderUserToken
  );

  // --- GraphQL ---

  const [queryResult] = useQuery({
    query: ROOT_ROUTE_QUERY,
    requestPolicy: "cache-and-network",
  });

  const [, createExampleSpace] = useMutation(
    CREATE_PLACEHOLDER_USER_AND_EXAMPLE_SPACE_MUTATION
  );

  const onClick = useCallback(() => {
    createExampleSpace({}).then(({ error, data }) => {
      if (error) {
        // TODO: Handle errors
        console.error(error);
        return;
      }

      if (!data?.result?.placeholderClientToken) {
        return;
      }

      setPlaceholderUserToken(data.result.placeholderClientToken);

      if (data.result.space.id) {
        navigate(pathToSpace(data.result.space.id));
      }
    });
  }, [createExampleSpace, setPlaceholderUserToken, navigate]);

  if (queryResult.fetching) {
    return <div>Loading...</div>;
  }

  if (queryResult.error) {
    return <div>Error {queryResult.error.message}</div>;
  }

  let content: JSX.Element;

  if (queryResult.data?.user) {
    content = <Dashboard dashboardFragment={queryResult.data.user} />;
  } else {
    content = (
      <EmptyStateContent>
        <BigButton $createExample onClick={onClick}>
          Create an example space
        </BigButton>
        {IS_LOGIN_ENABLED && (
          <BigButton onClick={() => window.location.assign(LOGIN_PATH)}>
            Log in / Sign up
          </BigButton>
        )}
      </EmptyStateContent>
    );
  }

  return <Container>{content}</Container>;
}
