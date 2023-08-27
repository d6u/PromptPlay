import { useQuery } from "@apollo/client";
import { Button } from "@mui/joy";
import { Link } from "wouter";
import { gql } from "../../__generated__";
import {
  API_SERVER_BASE_URL,
  IS_LOGIN_ENABLED,
  PROVIDE_FEEDBACK_LINK,
} from "../../constants";
import "./Header.css";

const HEADER_QUERY = gql(`
  query HeaderQuery {
    isLoggedIn
    user {
      email
    }
  }
`);

export default function Header() {
  const queryResult = useQuery(HEADER_QUERY, {
    fetchPolicy: "no-cache",
    skip: !IS_LOGIN_ENABLED,
  });

  if (queryResult.loading) {
    return <div>Loading...</div>;
  }

  if (IS_LOGIN_ENABLED && (queryResult.error || queryResult.data == null)) {
    return <div>Error! {queryResult.error?.message}</div>;
  }

  return (
    <header className="Header">
      <div className="Header_left">
        <Link to="/">
          <h1 className="Header_title">PrompPlay.xyz</h1>
        </Link>
        <a
          className="Header_feedback_link"
          href={PROVIDE_FEEDBACK_LINK}
          target="_blank"
          rel="noreferrer"
        >
          Provide feedback
        </a>
      </div>
      {IS_LOGIN_ENABLED && (
        <div className="Header_right">
          {queryResult.data?.isLoggedIn ? (
            <>
              <div className="Header_account_email">
                {queryResult.data.user?.email}
              </div>
              <Button
                onClick={() => {
                  window.location.assign(`${API_SERVER_BASE_URL}/logout`);
                }}
              >
                Log Out
              </Button>
            </>
          ) : (
            <Button
              color="success"
              onClick={() => {
                window.location.assign(`${API_SERVER_BASE_URL}/login`);
              }}
            >
              Log In
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
