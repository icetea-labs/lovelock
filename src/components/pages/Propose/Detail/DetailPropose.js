import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';

import { Helmet } from 'react-helmet';
import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import { callView, getTagsInfo } from '../../../../helper';
import TopContrainer from './TopContainer';
import LeftContainer from './LeftContainer';
import RightContrainer from './RightContainer';
import { NotFound } from '../../NotFound/NotFound';
import * as actions from '../../../../store/actions';

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
  const dispatch = useDispatch();
  const proIndex = parseInt(match.params.index, 10);
  const address = useSelector(state => state.account.address);
  // const topInfo = useSelector(state => state.loveinfo.topInfo);
  const [proposeInfo, setProposeInfo] = useState(null);

  useEffect(() => {
    callView('getProposeByIndex', [proIndex]).then(async propose => {
      // console.log('--------Detail propose loaded ------');
      const proInfo = propose[0] || {};
      const moreProInfo = await addInfoToProposes(proInfo);
      dispatch(actions.setTopInfo(moreProInfo));
      setProposeInfo(proInfo);
    });
  }, [proIndex]);

  const renderHelmet = () => {
    const isJournal = proposeInfo.sender === proposeInfo.receiver;
    // TODO: get sender & receiver's display name
    const title = isJournal
      ? `${proposeInfo.sender}'s Journal`
      : `Lovelock - ${proposeInfo.sender} & ${proposeInfo.receiver}`;
    const desc = proposeInfo.s_content;
    const coverImg = proposeInfo.coverImg
      ? process.env.REACT_APP_IPFS + proposeInfo.coverImg
      : `${process.env.PUBLIC_URL}/static/img/share.jpg`;
    return (
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="description" content={desc} />
        <meta property="og:image" content={coverImg} />
        <meta property="og:description" content={desc} />
      </Helmet>
    );
  };

  async function addInfoToProposes(respPro) {
    const pro = respPro;
    const { sender, receiver } = pro;

    const senderTags = await getTagsInfo(sender);
    pro.s_name = senderTags['display-name'];
    pro.s_publicKey = senderTags['pub-key'] || '';
    pro.s_avatar = senderTags.avatar;

    const botInfo = pro.bot_info;
    if (receiver === process.env.REACT_APP_BOT_LOVER) {
      pro.r_name = `${botInfo.firstname} ${botInfo.lastname}`;
      pro.r_publicKey = senderTags['pub-key'] || '';
      pro.r_avatar = botInfo.botAva;
      pro.r_content = botInfo.botReply;
    } else {
      const receiverTags = await getTagsInfo(receiver);
      pro.r_name = receiverTags['display-name'];
      pro.r_publicKey = receiverTags['pub-key'] || '';
      pro.r_avatar = receiverTags.avatar;
      pro.r_content = pro.r_content;
    }
    pro.publicKey = sender === address ? pro.r_publicKey : pro.s_publicKey;

    const info = pro.s_info;

    pro.coverImg = pro.coverImg || 'QmdQ61HJbJcTP86W4Lo9DQwmCUSETm3669TCMK42o8Fw4f';
    pro.s_date = info.date;
    pro.r_date = info.date;

    const accountInfo = {
      s_publicKey: pro.s_publicKey,
      s_address: pro.sender,
      s_name: pro.s_name,
      r_publicKey: pro.r_publicKey,
      r_address: pro.receiver,
      r_name: pro.r_name,
      publicKey: pro.publicKey,
    };
    dispatch(actions.setAccount(accountInfo));
    return pro;
  }

  if (proposeInfo) {
    isOwner = address === proposeInfo.sender || address === proposeInfo.receiver;
    isView = proposeInfo.status === 1 && proposeInfo.isPrivate === false;
  }

  const renderDetailPropose = () => (
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
          <RightContrainer proIndex={proIndex} isOwner={isOwner} />
        </FlexWidthBox>
      </FlexBox>

      {renderHelmet()}
    </React.Fragment>
  );

  const renderNotFound = () => <NotFound />;

  return (
    <React.Fragment>
      {proposeInfo && <React.Fragment>{isOwner || isView ? renderDetailPropose() : renderNotFound()}</React.Fragment>}
    </React.Fragment>
  );
}
