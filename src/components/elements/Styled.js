import React from "react";
import styled from "styled-components";

export const zIndex = {
  negitive: -1,
  zeroIndex: 0,
  normalZIndex: 100,
  inputLabel: 100,
  textContent: 100,
  input: 300,
  inputUnit: 600,
  fixedTableHeader: 700,
  filter: 800,
  fixedTab: 900,
  placeOrder: 900,
  placeOrderWidth: 1e3,
  dropdown: 1e3,
  calendar: 1e3,
  shade: 1e3,
  footer: 1e3,
  tradeOrders: 1e3,
  tradePair: 1e3,
  header: 1100,
  modal: 1100,
  loading: 1100,
  fullScreen: 1100,
  routeLoading: 1200,
};

export const BtnActive = styled.button`
  width: ${props => (props.width ? props.width : "100px")};
  height: ${props => (props.height ? props.height : "40px")};
  line-height: ${props => (props.height ? props.height : "40px")};
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  /* background: linear-gradient(90deg, rgba(239, 184, 11, 1) 0%, rgba(251, 218, 60, 1) 100%); */
  background: linear-gradient(
    90deg,
    rgba(24, 123, 221, 1) 0%,
    rgba(52, 197, 249, 1) 100%
  );
  border-radius: 3px;
  cursor: pointer;
  color: #fff;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: none;
  outline: none;
  box-sizing: border-box;
  &:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #999 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.3s, opacity 0.5s;
  }
  &:active:after {
    transform: scale(0, 0);
    opacity: 0.6;
    transition: 0s;
  }
  span {
    transition: transform 0.2s ease;
    @media (max-width: 768px) {
      width: 100%;
    }
  }
  a {
    transition: transform 0.2s ease;
    @media (max-width: 768px) {
      width: 100%;
    }
  }
  i {
    @media (max-width: 768px) {
      display: none;
    }
  }
  &:hover span {
    transform: scale(0.9);
  }
  &:hover a {
    transform: scale(0.9);
  }
  &:hover i {
    transform: scale(0.9);
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;
export const BtnInactive = styled(BtnActive)`
  background: #848e9c;
  box-shadow: none;
  width: ${props => (props.width ? props.width : "100px")};
  &:hover {
    transform: scale(1);
  }
`;
export const Loading = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #fff;
  border-left: 1px solid transparent;
  animation: load 0.8s infinite linear;
  align-self: center;
  @keyframes load {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
