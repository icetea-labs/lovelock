import React from 'react';
import styled from 'styled-components';

import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import TopContrainer from './TopContrainer';
import LeftContrainer from './LeftContrainer';
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

  return (
    <React.Fragment>
      <BannerContainer>
        <ShadowBox>
          <TopContrainer proIndex={proIndex} />
        </ShadowBox>
      </BannerContainer>

      <FlexBox wrap="wrap" minHeight="100vh">
        <FlexWidthBox width="30%">
          <LeftContrainer />
        </FlexWidthBox>
        <FlexWidthBox width="70%">
          <RightContrainer proIndex={proIndex} />
        </FlexWidthBox>
      </FlexBox>
    </React.Fragment>
  );
}
