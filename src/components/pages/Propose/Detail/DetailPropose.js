import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import { callView } from '../../../../helper';
import TopContrainer from './TopContainer';
import LeftContainer from './LeftContainer';
import RightContrainer from './RightContainer';

const BannerContainer = styled.div`
  margin-bottom: ${rem(20)};
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.15);
`;

export default function DetailPropose(props) {
  const { match } = props;
  const proIndex = parseInt(match.params.index, 10);
  const [topInfo, setTopInfo] = useState({});
  const address = useSelector(state => state.account.address);
  const [proposeInfo, setProposeInfo] = useState({});
  const isLoginisSender = address === proposeInfo.sender || address === proposeInfo.receiver;
  const isAcceptisPublic = proposeInfo.status === 1 && proposeInfo.isPrivate === false;
  // console.log('isLoginisSender', isLoginisSender);
  // console.log('isAcceptisPublic', isAcceptisPublic);

  useEffect(() => {
    (async () => {
      const proposes = await callView('getProposeByIndex', [proIndex]);
      const propose = proposes[0];
      // console.log('propose', propose);
      setProposeInfo(propose);
    })();
  }, [proIndex]);

  function getTopInfo(data) {
    setTopInfo(data);
  }

  if (address) {
    if (isLoginisSender) {
      return (
        <React.Fragment>
          <BannerContainer>
            <ShadowBox>
              <TopContrainer proIndex={proIndex} getTopInfo={getTopInfo} />
            </ShadowBox>
          </BannerContainer>

          <FlexBox wrap="wrap" minHeight="100vh">
            <FlexWidthBox width="30%">
              <LeftContainer />
            </FlexWidthBox>
            <FlexWidthBox width="70%">
              <RightContrainer proIndex={proIndex} topInfo={topInfo} />
            </FlexWidthBox>
          </FlexBox>
        </React.Fragment>
      );
    }
    if (isAcceptisPublic) {
      return (
        <React.Fragment>
          <BannerContainer>
            <ShadowBox>
              <TopContrainer proIndex={proIndex} getTopInfo={getTopInfo} />
            </ShadowBox>
          </BannerContainer>

          <FlexBox wrap="wrap" minHeight="100vh">
            <FlexWidthBox width="30%">
              <LeftContainer />
            </FlexWidthBox>
            <FlexWidthBox width="70%">
              <RightContrainer proIndex={proIndex} topInfo={topInfo} />
            </FlexWidthBox>
          </FlexBox>
        </React.Fragment>
      );
    }
    return (
      <div>
        <span>Oops! We couldn't find what you're looking for.</span>
      </div>
    );
  }
  if (isAcceptisPublic) {
    return (
      <React.Fragment>
        <BannerContainer>
          <ShadowBox>
            <TopContrainer proIndex={proIndex} getTopInfo={getTopInfo} />
          </ShadowBox>
        </BannerContainer>

        <FlexBox wrap="wrap" minHeight="100vh">
          <FlexWidthBox width="30%">
            <LeftContainer />
          </FlexWidthBox>
          <FlexWidthBox width="70%">
            <RightContrainer proIndex={proIndex} topInfo={topInfo} />
          </FlexWidthBox>
        </FlexBox>
      </React.Fragment>
    );
  }
  return (
    <div>
      <span>Oops! We couldn't find what you're looking for.</span>
    </div>
  );
}
