import React from 'react';
import styled from 'styled-components';
import { rem } from './StyledUtils';

const StyledLogo = styled.div`
  font-size: ${rem(20)};
  display: flex;
  align-items: center;
  span {
    margin: 0 ${rem(10)};
  }
  a {
    text-decoration: none;
  }
  cursor: pointer;
`;
const Title = styled.div`
  font-size: ${rem(20)};
  margin-top: ${rem(10)};
`;
export function HeaderAuthen(props) {
  const { title } = props;
  return (
    <div>
      <StyledLogo>
        <a href="/">
          <img src="/static/img/logo.svg" alt="itea-scan" />
          <span>LoveLock</span>
        </a>
      </StyledLogo>
      <Title>{title}</Title>
    </div>
  );
}
