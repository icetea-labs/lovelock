import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import { callView } from '../../../../helper';
import TopContrainer from './TopContainer';
import LeftContainer from './LeftContainer';
import RightContrainer from './RightContainer';
import { NotFound } from '../../NotFound/NotFound';

import { Helmet } from "react-helmet";

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

  function makeHelmet() {
    const isJournal = proposeInfo.sender === proposeInfo.receiver
    // TODO: get sender & receiver's display name
    const title = isJournal ? `${proposeInfo.sender}'s Journal` : `Lovelock - ${proposeInfo.sender} & ${proposeInfo.receiver}`
    const desc = proposeInfo.s_content
    const coverImg = proposeInfo.coverImg ? 
      process.env.REACT_APP_IPFS + proposeInfo.coverImg : process.env.PUBLIC_URL + '/static/img/share.jpg'
    return (
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="description" content={desc} />
        <meta property="og:image" content={coverImg} />
        <meta property="og:description" content={desc} />
      </Helmet>
    )
  }

  if (!proposeInfo.sender) {
    // loading propose from contract, please wait
    return <div />
  }

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

        {makeHelmet()}
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

        {makeHelmet()}
      </React.Fragment>
    );
  }

  return <NotFound />;

  // if (isAcceptisPublic) {
  //   return (
  //     <React.Fragment>
  //       <BannerContainer>
  //         <ShadowBox>
  //           <TopContrainer proIndex={proIndex} getTopInfo={getTopInfo} />
  //         </ShadowBox>
  //       </BannerContainer>

  //       <FlexBox wrap="wrap" minHeight="100vh">
  //         <FlexWidthBox width="30%">
  //           <LeftContainer />
  //         </FlexWidthBox>
  //         <FlexWidthBox width="70%">
  //           <RightContrainer proIndex={proIndex} topInfo={topInfo} />
  //         </FlexWidthBox>
  //       </FlexBox>
  //     </React.Fragment>
  //   );
  // }
  // return (
  //   <div>
  //     <span>Oops! We couldn't find what you're looking for.</span>
  //   </div>
  // );
}
