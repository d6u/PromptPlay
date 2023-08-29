import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@mui/joy";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { gql } from "../../__generated__";
import { IS_LOGIN_ENABLED, PROVIDE_FEEDBACK_LINK } from "../../constants";
import { placeholderUserTokenState } from "../../state/store";
import { LOGIN_PATH, LOGOUT_PATH } from "../../static/routeConfigs";
import StyleResetLink from "../common/StyleResetLink";

const HEADER_QUERY = gql(`
  query HeaderQuery {
    isLoggedIn
    isPlaceholderUserTokenInvalid
    user {
      email
      profilePictureUrl
    }
  }
`);

const MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION = gql(`
  mutation MergePlaceholderUserWithLoggedInUserMutation(
    $placeholderUserToken: String!
  ) {
    result: mergePlaceholderUserWithLoggedInUser(
      placeholderUserToken: $placeholderUserToken
    )
  }
`);

const Container = styled.div`
  height: 60px;
  padding: 0px 20px;
  flex-shrink: 0;
  border-bottom: 1px solid #ececf1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 20px;
`;

const Logo = styled.h1`
  font-size: 24px;
`;

const FeedbackLink = styled.a`
  font-size: 14px;
  text-decoration: none;
  color: initial;

  &:hover {
    text-decoration: underline;
  }
`;

const AccountManagementContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: row;
  align-items: center;
`;

const ProfilePicture = styled.img`
  aspect-ratio: 1 / 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const Email = styled.div`
  color: #000;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

export default function Header() {
  let [searchParams, setSearchParams] = useSearchParams();

  const [placeholderUserToken, setPlaceholderUserToken] = useRecoilState(
    placeholderUserTokenState
  );

  const [mergePlaceholderUserWithLoggedInUser] = useMutation(
    MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION,
    {
      refetchQueries: [{ query: HEADER_QUERY }],
    }
  );

  const queryResult = useQuery(HEADER_QUERY, {
    fetchPolicy: "no-cache",
    skip: !IS_LOGIN_ENABLED,
  });

  const isNewUser = searchParams.get("new_user") === "true";
  const isPlaceholderUserTokenInvalid =
    queryResult.data?.isPlaceholderUserTokenInvalid === true;
  const isLoggedIn = queryResult.data?.isLoggedIn === true;

  // TODO: Putting this logic in this component is pretty ad-hoc, and this will
  // break if Header is not always rendered on page.
  useEffect(() => {
    if (placeholderUserToken === "") {
      return;
    }

    if (isPlaceholderUserTokenInvalid) {
      setPlaceholderUserToken("");
    }

    if (!isPlaceholderUserTokenInvalid && isLoggedIn && isNewUser) {
      setSearchParams({});

      mergePlaceholderUserWithLoggedInUser({
        variables: { placeholderUserToken },
      }).then(() => {
        setPlaceholderUserToken("");
      });
    }
  }, [
    isPlaceholderUserTokenInvalid,
    isLoggedIn,
    isNewUser,
    placeholderUserToken,
    setPlaceholderUserToken,
    setSearchParams,
    mergePlaceholderUserWithLoggedInUser,
  ]);

  if (queryResult.loading) {
    return <div>Loading...</div>;
  }

  if (IS_LOGIN_ENABLED && (queryResult.error || !queryResult.data)) {
    return <div>Error! {queryResult.error?.message}</div>;
  }

  return (
    <Container>
      <LogoContainer>
        <StyleResetLink to="/">
          <Logo>PromptPlay.xyz</Logo>
        </StyleResetLink>
        <FeedbackLink
          href={PROVIDE_FEEDBACK_LINK}
          target="_blank"
          rel="noreferrer"
        >
          Provide feedback
        </FeedbackLink>
      </LogoContainer>
      {IS_LOGIN_ENABLED && (
        <AccountManagementContainer>
          {queryResult.data?.isLoggedIn ? (
            <>
              {queryResult.data.user?.profilePictureUrl && (
                <ProfilePicture
                  src={queryResult.data.user?.profilePictureUrl}
                  alt="profile-pic"
                  referrerPolicy="no-referrer"
                />
              )}
              <Email>{queryResult.data.user?.email}</Email>
              <Button
                size="sm"
                variant="plain"
                onClick={() => window.location.assign(LOGOUT_PATH)}
              >
                Log Out
              </Button>
            </>
          ) : (
            <Button
              color="success"
              onClick={() => window.location.assign(LOGIN_PATH)}
              size="sm"
              variant="solid"
            >
              Log in / Sign up
            </Button>
          )}
        </AccountManagementContainer>
      )}
    </Container>
  );
}
