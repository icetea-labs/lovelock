import React from 'react';
import styled from 'styled-components';
import { rem } from './StyledUtils';

const StyledLogo = styled.a`
  font-size: ${rem(20)};
  display: flex;
  align-items: flex-end;
  text-decoration: none;
  cursor: pointer;
  span {
    margin: ${rem(2)} ${rem(10)};
  }
  &:hover {
    text-decoration: none;
  }
`;
const Title = styled.div`
  font-size: ${rem(20)};
  margin-top: ${rem(15)};
`;
export function HeaderAuthen(props) {
  const { title } = props;
  return (
    <div>
      <StyledLogo href="/">
        <img src="/static/img/logo.svg" alt="itea-scan" />
        <span>LoveLock</span>
      </StyledLogo>
      <Title>{title}</Title>
    </div>
  );
}
