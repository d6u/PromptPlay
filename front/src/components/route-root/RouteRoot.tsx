import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import Header from '../common/header/Header';

export default function RouteRoot() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has('new_user')) {
      searchParams.delete('new_user');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return (
    <RootContainer>
      <Header />
      <Outlet />
    </RootContainer>
  );
}

const RootContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
