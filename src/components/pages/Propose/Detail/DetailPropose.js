import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import { callView } from '../../../../helper';
import TopContrainer from './TopContainer';
import LeftContainer from './LeftContainer';
import RightContrainer from './RightContainer';
import { NotFound } from '../../NotFound/NotFound';

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
  let isOwner = false;
  let isView = false;
  const proIndex = parseInt(match.params.index, 10);
  const address = useSelector(state => state.account.address);
  const [proposeInfo, setProposeInfo] = useState(null);

  useEffect(() => {
    callView('getProposeByIndex', [proIndex]).then(propose => {
      // console.log('propose', propose);
      setProposeInfo((propose && propose[0]) || {});
    });
  }, [proIndex]);

  const renderDetailPropose = (
    <React.Fragment>
      <BannerContainer>
        <ShadowBox>
          <TopContrainer proIndex={proIndex} />
        </ShadowBox>
      </BannerContainer>

      <FlexBox wrap="wrap" minHeight="100vh">
        <FlexWidthBox width="30%">
          <LeftContainer />
        </FlexWidthBox>
        <FlexWidthBox width="70%">
          <RightContrainer proIndex={proIndex} />
        </FlexWidthBox>
      </FlexBox>
    </React.Fragment>
  );

  const renderNotFound = <NotFound />;

  if (proposeInfo) {
    isOwner = address === proposeInfo.sender || address === proposeInfo.receiver;
    isView = proposeInfo.status === 1 && proposeInfo.isPrivate === false;
  }

  return (
    <React.Fragment>
      {proposeInfo && <React.Fragment>{isOwner || isView ? renderDetailPropose : renderNotFound}</React.Fragment>}
    </React.Fragment>
  );
}
