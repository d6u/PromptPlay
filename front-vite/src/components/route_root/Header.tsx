import { Button } from "@mui/joy";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useMutation, useQuery } from "urql";
import { IS_LOGIN_ENABLED, PROVIDE_FEEDBACK_LINK } from "../../constants";
import { usePersistStore } from "../../state/zustand";
import { LOGIN_PATH, LOGOUT_PATH } from "../../static/routeConfigs";
import StyleResetLink from "../common/StyleResetLink";
import {
  HEADER_QUERY,
  MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION,
} from "./graphql";

const Container = styled.div`
  height: 51px;
  border-bottom: 1px solid #ececf1;
  padding: 0px 20px;
  flex-shrink: 0;
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
  font-size: 20px;
  margin: 0px;
  line-height: 1;
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

  const placeholderUserToken = usePersistStore(
    (state) => state.placeholderUserToken
  );
  const setPlaceholderUserToken = usePersistStore(
    (state) => state.setPlaceholderUserToken
  );

  const [, mergePlaceholderUserWithLoggedInUser] = useMutation(
    MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION
  );

  const [queryResult] = useQuery({
    query: HEADER_QUERY,
    requestPolicy: "network-only",
    pause: !IS_LOGIN_ENABLED,
  });

  const isNewUser = searchParams.get("new_user") === "true";
  const isPlaceholderUserTokenInvalid =
    queryResult.data?.isPlaceholderUserTokenInvalid === true;
  const isLoggedIn = queryResult.data?.isLoggedIn === true;

  // TODO: Putting this logic in this component is pretty ad-hoc, and this will
  // break if Header is not always rendered on page.
  useEffect(() => {
    if (!placeholderUserToken) {
      return;
    }

    if (isPlaceholderUserTokenInvalid) {
      setPlaceholderUserToken(null);
    }

    if (!isPlaceholderUserTokenInvalid && isLoggedIn && isNewUser) {
      setSearchParams({});

      mergePlaceholderUserWithLoggedInUser({
        placeholderUserToken,
      }).then(() => {
        setPlaceholderUserToken(null);
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

  if (queryResult.fetching) {
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
