import { useQuery } from "@apollo/client";
import { Button } from "@mui/joy";
import styled from "styled-components";
import { gql } from "../../__generated__";
import { IS_LOGIN_ENABLED, PROVIDE_FEEDBACK_LINK } from "../../constants";
import { LOGIN_PATH, LOGOUT_PATH } from "../../static/routeConfigs";
import StyleResetLink from "../common/StyleResetLink";

const HEADER_QUERY = gql(`
  query HeaderQuery {
    isLoggedIn
    user {
      email
    }
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

const Email = styled.div`
  color: #000;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

export default function Header() {
  const queryResult = useQuery(HEADER_QUERY, {
    fetchPolicy: "no-cache",
    skip: !IS_LOGIN_ENABLED,
  });

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
              <Email>{queryResult.data.user?.email}</Email>
              <Button onClick={() => window.location.assign(LOGOUT_PATH)}>
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
