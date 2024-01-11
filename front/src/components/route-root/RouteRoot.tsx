import styled from '@emotion/styled';
import { Outlet } from 'react-router-dom';
import Header from '../common/header/Header';

export default function RouteRoot() {
  return (
    <Container>
      <Header />
      <Outlet />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
