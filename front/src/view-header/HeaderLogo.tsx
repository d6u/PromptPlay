import styled from '@emotion/styled';
import { PROVIDE_FEEDBACK_LINK } from 'global-config/global-config';
import { useEffect, useState } from 'react';
import StyleResetLink from '../components/common/StyleResetLink';

export default function HeaderLogo() {
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

  return (
    <LogoContainer>
      <StyleResetLink to="/">
        <Logo>PromptPlay.xyz</Logo>
      </StyleResetLink>
      <FeedbackLink
        href={PROVIDE_FEEDBACK_LINK}
        target="_blank"
        rel="noreferrer"
      >
        {useNarrowLayout ? 'Feedback' : 'Give Feedback'}
      </FeedbackLink>
    </LogoContainer>
  );
}

const LogoContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 20px;

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
