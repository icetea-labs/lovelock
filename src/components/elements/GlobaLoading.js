import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
`;
const Rect = styled.div`
  width: 50px;
  height: 35px;
  text-align: center;
  font-size: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  div {
    background-color: #15b5dd;
    height: 100%;
    width: 3px;
    display: inline-block;
    margin: 0px 3px;
    animation: 1.2s ease-in-out 0s infinite normal none running load;
    &:nth-child(1) {
      animation-delay: -1.1s;
    }
    &:nth-child(2) {
      animation-delay: -1s;
    }
    &:nth-child(3) {
      animation-delay: -0.9s;
    }
    &:nth-child(4) {
      animation-delay: -0.8s;
    }
  }
  @keyframes load {
    0%,
    40%,
    100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }
`;

function GlobaLoading() {
  return (
    <Wrapper>
      <BaseGlobaLoading />
    </Wrapper>
  );
}

function BaseGlobaLoading() {
  return (
    <Rect>
      <div />
      <div />
      <div />
      <div />
    </Rect>
  );
}

export { GlobaLoading };
export default GlobaLoading;
