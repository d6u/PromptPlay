import styled from '@emotion/styled';
import HeaderAccountDetail from './HeaderAccountDetail';
import HeaderLogo from './HeaderLogo';
import SpaceName from './SpaceName';

export default function Header() {
  return (
    <Container>
      <HeaderLogo />
      <SpaceNameContainer>
        <SpaceName />
      </SpaceNameContainer>
      <HeaderAccountDetail />
    </Container>
  );
}

// ANCHOR: UI Components

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

const SpaceNameContainer = styled.div`
  @media (max-width: 600px) {
    & {
      display: none;
    }
  }
`;
