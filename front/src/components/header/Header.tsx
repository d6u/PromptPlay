import { gql } from "../../__generated__";
import { API_SERVER_BASE_URL, IS_LOGIN_ENABLED } from "../../constants";
import "./Header.css";
import { useQuery } from "@apollo/client";
import { Button } from "@mui/joy";
import { Link } from "wouter";

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
  });

  if (queryResult.loading) {
    return <div>Loading...</div>;
  }

  if (queryResult.error || queryResult.data == null) {
    return <div>Error! {queryResult.error?.message}</div>;
  }

  return (
    <header className="Header">
      <Link to="/">
        <h1 className="Header_title">PrompPlay.xyz</h1>
      </Link>
      {IS_LOGIN_ENABLED && (
        <div className="Header_account">
          {queryResult.data.isLoggedIn ? (
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
