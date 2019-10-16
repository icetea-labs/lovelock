import React, { useState } from 'react';
import styled from 'styled-components';

import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import TopContrainer from './TopContrainer';
import LeftContainer from './LeftContainer';
import RightContrainer from './RightContrainer';

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

  function getTopInfo(data) {
    setTopInfo(data);
  }

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
