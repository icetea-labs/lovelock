// import React from 'react';
import styled, { css } from 'styled-components';

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
  width: ${props => (props.width ? props.width : '100px')};
  height: ${props => (props.height ? props.height : '40px')};
  line-height: ${props => (props.height ? props.height : '40px')};
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  /* background: linear-gradient(90deg, rgba(239, 184, 11, 1) 0%, rgba(251, 218, 60, 1) 100%); */
  background: linear-gradient(90deg, rgba(24, 123, 221, 1) 0%, rgba(52, 197, 249, 1) 100%);
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
    content: '';
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
  width: ${props => (props.width ? props.width : '100px')};
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
export const px2rem = px => `${px / 16}rem`;
export const rem = px => `${px / 16}rem`;
export const media = {
  pc: (...args) =>
    css`
      @media (min-width: ${pc.pageminwidth}) {
        ${css(...args)}
      }
    `,
  mobile: (...args) =>
    css`
      @media (max-width: ${mobile.pagemaxwidth}) {
        ${css(...args)}
      }
    `,
};
export const pc = {
  pageminwidth: '960',
  pagemaxwidth: '100%',
  contentmaxwidth: '1200',
  // topleft: "25%",
  // topright: "20%",
};
export const mobile = {
  pageminwidth: '320',
  pagemaxwidth: '960',
  contentmaxwidth: '750',
  // topleft: "100%",
  // topright: "100%",
};

export const FlexBox = styled.div`
  display: flex;
  flex-direction: ${props => props.direction};
  justify-content: ${props => props.justify};
  align-items: ${props => props.align};
  flex: ${props => props.flex};
  padding: ${props => props.padding};
  height: ${props => props.height};
  width: ${props => props.width};
  min-height: ${props => props.minHeight};
  flex-wrap: ${props => props.wrap};
  margin: ${props => props.margin};
  margin-top: ${props => props.marginTop};
  margin-bottom: ${props => props.marginBottom};
  margin-left: ${props => props.marginLeft};
  margin-right: ${props => props.marginRight};
`;
export const FlexWidthBox = styled.div`
  width: ${props => props.width};
  ${media.mobile`
    width: 100%;
  `}
`;
export const FlexItem = styled.div`
  flex: ${props => props.flex || 1};
  padding: ${props => props.padding};
  margin: ${props => props.margin};
  width: ${props => props.width};
`;
export const ShadowBoxBK = styled.div.attrs({
  className: 'shadow_box',
})`
  width: ${props => props.width};
  background-color: #fff;
  box-shadow: 0px 2px 10px 0px rgba(90, 102, 124, 0.1);
  padding: ${props => props.padding};
  box-sizing: border-box;
  margin: ${props => props.margin};
  ::-webkit-scrollbar {
    width: 4px;
    border-radius: 4px;
    background-color: #fff;
  }
  ::-webkit-scrollbar-track {
    background-color: #fff;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: #dfe2e7;
  }
  ::-webkit-scrollbar-corner {
    background-color: #fff;
  }
  ${media.mobile`
    padding: ${props => props.padding && '16px 12px'};
    margin: 0px 0px 16px 0px;
  `}
`;
export const TextOvewflow = styled.div.attrs({
  className: 'text-overflow',
})`
  width: ${props => props.width};
`;
export const LayoutDisplay = styled.div`
  position: fixed;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.4);
`;
export const DivControlBtnKeystore = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px 0 0 0;
  font-size: 14px;
  @media (min-width: 320px) and (max-width: 623px) {
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 70px;
    .previous-button {
      order: 1;
    }
    .download-keystore {
      order: 0;
      margin-top: 20px;
    }
  }
`;

export const DivPassRecover = styled.div`
  padding: 10px 0 0 0;
`;
export const LayoutAuthen = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  padding-bottom: 50px;
  justify-content: center;
`;
export const BoxAuthen = styled.div`
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  @media (min-width: 1900px) {
    top: 190px;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
  .btRegister {
    padding-top: 20px;
    text-align: center;
    /* font-size: ${rem(12)}; */
  }
`;
export const ShadowBoxAuthen = styled.div`
  /* width: 100%; */
  background: #fff;
  border: 1px solid #dee2e6 !important;
  border-radius: 10px;
  box-shadow: 0 0 10px #e4e4e4;
  padding: ${rem(40)} ${rem(54)};
  @media (min-width: 320px) and (max-width: 623px) {
    box-shadow: none;
    padding: 5px 20px;
    box-sizing: border-box;
  }
  @media (min-width: 624px) {
    min-width: ${rem(400)};
  }
`;
