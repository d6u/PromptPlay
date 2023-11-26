import styled from "@emotion/styled";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { PROVIDE_FEEDBACK_LINK } from "../../../constants";
import { graphql } from "../../../gql";
import { useLocalStorageStore } from "../../../state/appState";
import { LOGIN_PATH, LOGOUT_PATH } from "../../../utils/route-utils";
import IconLogout from "../../icons/IconLogout";
import StyleResetLink from "../StyleResetLink";
import SpaceName from "./SpaceName";

export default function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewUser = searchParams.get("new_user") === "true";

  const placeholderUserToken = useLocalStorageStore.use.placeholderUserToken();
  const setPlaceholderUserToken =
    useLocalStorageStore.use.setPlaceholderUserToken();

  const [queryResult] = useQuery({
    query: HEADER_QUERY,
    requestPolicy: "network-only",
  });

  const isPlaceholderUserTokenInvalid =
    queryResult.data?.isPlaceholderUserTokenInvalid === true;
  const isLoggedIn = queryResult.data?.isLoggedIn === true;
  const userId = queryResult.data?.user?.id;
  const email = queryResult.data?.user?.email;

  useEffect(() => {
    if (isLoggedIn) {
      posthog.identify(userId, { email });
    }
  }, [email, isLoggedIn, userId]);

  const [, mergePlaceholderUserWithLoggedInUser] = useMutation(
    MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION,
  );

  useEffect(() => {
    // TODO: Putting this logic in this component is pretty ad-hoc, and this
    // will break if Header is not always rendered on page.

    maybeMergeUsers();

    async function maybeMergeUsers() {
      if (!placeholderUserToken) {
        return;
      }

      if (isPlaceholderUserTokenInvalid) {
        setPlaceholderUserToken(null);
        return;
      }

      if (isLoggedIn && isNewUser) {
        setSearchParams({});

        await mergePlaceholderUserWithLoggedInUser({
          placeholderUserToken,
        });

        setPlaceholderUserToken(null);
      }
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

  const [useNarrowLayout, setUseNarrowLayout] = useState(
    window.innerWidth < 900,
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 900) {
        setUseNarrowLayout(true);
      } else {
        setUseNarrowLayout(false);
      }
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (queryResult.fetching) {
    return <div>Loading...</div>;
  }

  if (queryResult.error || !queryResult.data) {
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
          {useNarrowLayout ? "Feedback" : "Give Feedback"}
        </FeedbackLink>
      </LogoContainer>
      <SpaceNameContainer>
        <SpaceName />
      </SpaceNameContainer>
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
            {useNarrowLayout ? null : (
              <Email>{queryResult.data.user?.email}</Email>
            )}
            {useNarrowLayout ? (
              <IconButton onClick={() => window.location.assign(LOGOUT_PATH)}>
                <StyledLogoutIcon />
              </IconButton>
            ) : (
              <Button
                variant="plain"
                onClick={() => window.location.assign(LOGOUT_PATH)}
              >
                Log Out
              </Button>
            )}
          </>
        ) : (
          <Button
            color="success"
            onClick={() => window.location.assign(LOGIN_PATH)}
          >
            {useNarrowLayout ? "Login" : "Log in / Sign up"}
          </Button>
        )}
      </AccountManagementContainer>
    </Container>
  );
}

// SECTION: GraphQL

const HEADER_QUERY = graphql(`
  query HeaderQuery {
    isLoggedIn
    isPlaceholderUserTokenInvalid
    user {
      id
      email
      profilePictureUrl
    }
  }
`);

const MERGE_PLACEHOLDER_USER_WITH_LOGGED_IN_USER_MUTATION = graphql(`
  mutation MergePlaceholderUserWithLoggedInUserMutation(
    $placeholderUserToken: String!
  ) {
    result: mergePlaceholderUserWithLoggedInUser(
      placeholderUserToken: $placeholderUserToken
    ) {
      id
      spaces {
        id
      }
    }
  }
`);

// !SECTION

// SECTION: UI Components

const Container = styled.div`
  height: 51px;
  border-bottom: 1px solid #ececf1;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;

  @media (max-width: 900px) {
    padding: 0px 10px;
  }

  @media (max-width: 600px) {
    & {
      grid-template-columns: 1fr 1fr;
    }
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 20px;

  @media (max-width: 900px) {
    gap: 10px;
  }
`;

const SpaceNameContainer = styled.div`
  @media (max-width: 600px) {
    & {
      display: none;
    }
  }
`;

const AccountManagementContainer = styled.div`
  justify-self: flex-end;

  display: flex;
  gap: 20px;
  flex-direction: row;
  align-items: center;

  @media (max-width: 900px) {
    gap: 10px;
  }
`;

const Logo = styled.h1`
  font-size: 20px;
  margin: 0px;
  line-height: 1;

  @media (max-width: 900px) {
    font-size: 18px;
  }
`;

const FeedbackLink = styled.a`
  font-size: 14px;
  text-decoration: none;
  color: initial;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 900px) {
    font-size: 12px;
  }
`;

const ProfilePicture = styled.img`
  aspect-ratio: 1 / 1;
  width: 40px;
  border-radius: 50%;

  @media (max-width: 900px) {
    width: 32px;
  }
`;

const Email = styled.div`
  color: #000;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const StyledLogoutIcon = styled(IconLogout)`
  width: 20px;
`;

// !SECTION
