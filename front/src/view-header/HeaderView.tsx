import styled from '@emotion/styled';
import type { ReactNode } from 'react';

import {
  RootRouteSubRoute,
  useRootRouteSubRouteHandle,
} from 'generic-util/route';

import DashboardTabSwitcher from './DashboardTabSwitcher';
import HeaderAccountDetail from './HeaderAccountDetail';
import HeaderLogo from './HeaderLogo';
import SpaceName from './SpaceName';

function HeaderView() {
  const subRouteType = useRootRouteSubRouteHandle((h) => h.subRouteType);

  let middleContent: ReactNode;
  switch (subRouteType) {
    case RootRouteSubRoute.Dashboard: {
      middleContent = <DashboardTabSwitcher />;
      break;
    }
    case RootRouteSubRoute.Flows: {
      middleContent = <SpaceName />;
      break;
    }
  }

  return (
    <Container>
      <HeaderLogo />
      <MiddleContentContainer>{middleContent}</MiddleContentContainer>
      <HeaderAccountDetail />
    </Container>
  );
}

const Container = styled.div`
  grid-area: header;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;
  border-bottom: 1px solid #ececf1;

  @media (max-width: 900px) {
    padding: 0px 10px;
  }

  @media (max-width: 600px) {
    & {
      grid-template-columns: 1fr 1fr;
    }
  }
`;

const MiddleContentContainer = styled.div`
  @media (max-width: 600px) {
    & {
      display: none;
    }
  }
`;

export default HeaderView;
