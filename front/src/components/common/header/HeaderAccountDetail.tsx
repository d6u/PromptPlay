import styled from '@emotion/styled';
import { Button, IconButton } from '@mui/joy';
import { LOGIN_PATH, LOGOUT_PATH } from 'generic-util/route-utils';
import IconLogout from 'icons/IconLogout';
import posthog from 'posthog-js';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'urql';
import { graphql } from '../../../gql';

export default function HeaderAccountDetail() {
  const [queryResult] = useQuery({
    query: graphql(`
      query HeaderAccountDetailQuery {
        user {
          isPlaceholderUser
          id
          email
          profilePictureUrl
        }
      }
    `),
    requestPolicy: 'network-only',
  });

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
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const onClickLogout = useCallback(() => {
    posthog.reset();
    window.location.assign(LOGOUT_PATH);
  }, []);

  return (
    <AccountManagementContainer>
      {queryResult.data?.user?.isPlaceholderUser === false ? (
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
            <IconButton onClick={onClickLogout}>
              <StyledLogoutIcon />
            </IconButton>
          ) : (
            <Button variant="plain" onClick={onClickLogout}>
              Log Out
            </Button>
          )}
        </>
      ) : (
        <Button
          color="success"
          onClick={() => window.location.assign(LOGIN_PATH)}
        >
          {useNarrowLayout ? 'Login' : 'Log in / Sign up'}
        </Button>
      )}
    </AccountManagementContainer>
  );
}

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
