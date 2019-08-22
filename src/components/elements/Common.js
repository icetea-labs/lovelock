// import React from 'react';
import styled, { css } from 'styled-components';

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
export const ShadowBox = styled.div.attrs({
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
