import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";
import { gql } from "../../__generated__";
import { IS_LOGIN_ENABLED } from "../../constants";
import { placeholderUserTokenState } from "../../state/store";
import Dashboard from "./dashboard/Dashboard";
import { ROOT_ROUTE_QUERY } from "./queries";
import "./RootRoute.css";

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

export default function RootRoute() {
  const navigate = useNavigate();

  // --- Global State ---

  const setPlaceholderUserToken = useSetRecoilState(placeholderUserTokenState);

  const queryResult = useQuery(ROOT_ROUTE_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const [createExampleSpace] = useMutation(CREATE_EXAMPLE_SPACE_MUTATION, {
    refetchQueries: [ROOT_ROUTE_QUERY],
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
        navigate(`/spaces/${data.createExampleSpace.space.id}`);
      }
    });
  }, [createExampleSpace, setPlaceholderUserToken, navigate]);

  if (queryResult.loading) {
    return <div>Loading...</div>;
  }

  if (queryResult.error != null) {
    return <div>Error! {queryResult.error.message}</div>;
  }

  let content: JSX.Element;

  if (queryResult.data?.user) {
    content = <Dashboard dashboardFragment={queryResult.data.user} />;
  } else {
    content = (
      <EmptyStateContent>
        <button
          className="RootRoute_big_button RootRoute_big_button_create_example"
          onClick={onClickCreateExamples}
        >
          Create an example space
        </button>
        {IS_LOGIN_ENABLED && (
          <button className="RootRoute_big_button">Sign up / Login</button>
        )}
      </EmptyStateContent>
    );
  }

  return <Container>{content}</Container>;
}
