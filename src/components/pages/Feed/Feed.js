import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';

import { rem } from '../../elements/StyledUtils';
import TopFeed from './TopFeed';
import LeftFeed from './LeftFeed';
import RightFeed from './RightFeed';

const BannerContainer = styled.div`
  margin-bottom: ${rem(20)};
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.15);
  @media (max-width: 768px) {
    padding: 16px;
  }
`;
const ProposeWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  .proposeColumn {
    &--left {
      width: 30%;
    }
    &--right {
      width: 70%;
    }
  }
  @media (max-width: 768px) {
    display: block;
    .proposeColumn {
      width: 100%;
    }
  }
`;

export default function Feed(props) {
  const address = useSelector(state => state.account.address);
  const { match } = props;
  const feedAddress = match.params.address || address;

  console.log('paramAdress', feedAddress);

  return (
    <React.Fragment>
      <BannerContainer>
        <ShadowBox>
          <TopFeed feedAddress={feedAddress} />
        </ShadowBox>
      </BannerContainer>

      <ProposeWrapper>
        <div className="proposeColumn proposeColumn--left">
          <LeftFeed feedAddress={feedAddress} />
        </div>
        <div className="proposeColumn proposeColumn--right">
          <RightFeed feedAddress={feedAddress} />
        </div>
      </ProposeWrapper>
      {/* {proposeInfo && renderHelmet()} */}
    </React.Fragment>
  );
}
