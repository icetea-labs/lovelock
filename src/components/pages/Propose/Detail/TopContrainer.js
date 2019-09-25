import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';
import { callView, getTagsInfo, TimeWithFormat } from '../../../../helper';
import * as actions from '../../../../store/actions';
import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';

import { AvatarPro } from '../../../elements';

const TopContainerBox = styled.div`
  .top__coverimg {
    position: relative;
    overflow: hidden;
    max-width: ${rem(900)};
    max-height: ${rem(425)};
    min-height: ${rem(225)};
    img {
      width: 100%;
      height: 100%;
    }
  }
  .top__title {
    display: flex;
    align-items: center;
    padding: ${rem(20)} 0;
    border-bottom: 1px dashed #ebebeb;
    img {
      padding-right: ${rem(15)};
    }
    .title__content {
      color: #8250c8;
      font-weight: 600;
      width: 100%;
      text-align: left;
    }
    .title__date {
      color: #8f8f8f;
    }
  }
`;
const WarrperChatBox = styled(FlexBox)`
  margin-top: ${rem(35)};
  /* & > div:first-child {
    padding-right: ${rem(15)};
  } */
  div:nth-child(even) .content_detail p {
    background-image: -webkit-linear-gradient(128deg, #ad76ff, #8dc1fe);
    background-image: linear-gradient(322deg, #ad76ff, #8dc1fe);
  }
  .proposeMes {
    display : flex;
  }
  .user_photo {
    display: block;
    img {
      width: 58px;
      height: 58px;
      border-radius: 10px;
    }
    object-fit: contain;
    overflow: hidden;
  }
  .name_time {
    .user_name {
      font-weight: 600;
      text-transform: capitalize;
      color: #8250c8;
      width: 100%;
    }
    .time {
      font-size: ${rem(12)};
      color: #8f8f8f;
    }
  }
  .content_detail {
    display: block;
    width: calc(100% - 58px - 15px);
    padding: 0 ${rem(10)};
  }
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .clearfix::after {
    display: block;
    clear: both;
    content: "";
  }
  p {
    display: block;
    padding: ${rem(11)} ${rem(14)};
    font-size: ${rem(12)};
    line-height: ${rem(18)};
    color: #ffffff;
    border-radius: 10px;
    margin-top: 10px;
    box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.1);
    background-image: -webkit-linear-gradient(113deg, #76a8ff, #8df6fe);
    background-image: linear-gradient(337deg, #76a8ff, #8df6fe);
  }
`;

const useStyles = makeStyles({
  card: {
    width: '100%',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 10,
  },
});

export default function TopContrainer(props) {
  const { proIndex } = props;
  const dispatch = useDispatch();
  const address = useSelector(state => state.account.address);
  const propose = useSelector(state => state.loveinfo.propose);
  const [topInfo, setTopInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposes();
  }, [proIndex]);

  function loadProposes() {
    window.scrollTo(0, 0);
    setLoading(true);
    setTimeout(async () => {
      try {
        const infoCache = propose.filter(item => item.id === proIndex)[0] || [];
        if (typeof infoCache !== 'undefined' && infoCache.length > 0) {
          setTopInfo(infoCache);
        } else {
          const resp = (await callView('getProposeByIndex', [proIndex])) || [];
          const newPropose = await addInfoToProposes(resp[0]);
          // console.log('newPropose', newPropose);
          setTopInfo(newPropose || []);
        }
      } catch (e) {
        console.log('loadProposes', e);
      }
      setLoading(false);
    }, 10);
  }

  async function addInfoToProposes(respPro) {
    const proposes = respPro;
    const { sender, receiver } = proposes;

    const senderTags = await getTagsInfo(sender);
    proposes.s_name = senderTags['display-name'];
    proposes.s_publicKey = senderTags['pub-key'] || '';
    proposes.s_avatar = senderTags.avatar;

    const botInfo = JSON.parse(proposes.bot_info || '{}');
    // console.log('botInfo', botInfo);

    if (receiver === process.env.REACT_APP_BOT_LOVER) {
      proposes.r_name = `${botInfo.firstname} ${botInfo.lastname}`;
      proposes.r_publicKey = senderTags['pub-key'] || '';
      proposes.r_avatar = botInfo.botAva;
      proposes.r_content = botInfo.botReply;
    } else {
      const receiverTags = await getTagsInfo(receiver);
      proposes.r_name = receiverTags['display-name'];
      proposes.r_publicKey = receiverTags['pub-key'] || '';
      proposes.r_avatar = receiverTags.avatar;
      proposes.r_content = proposes.r_content;
    }
    proposes.publicKey = sender === address ? proposes.r_publicKey : proposes.s_publicKey;

    const info = JSON.parse(proposes.s_info) || {};
    proposes.coverimg = info.hash || 'QmdQ61HJbJcTP86W4Lo9DQwmCUSETm3669TCMK42o8Fw4f';
    proposes.s_date = info.date;
    proposes.r_date = info.date;

    const accountInfo = {
      s_publicKey: proposes.s_publicKey,
      s_address: proposes.sender,
      r_publicKey: proposes.r_publicKey,
      r_address: proposes.receiver,
      publicKey: proposes.publicKey,
    };
    dispatch(actions.setAccount(accountInfo));
    return proposes;
  }

  const classes = useStyles();

  if (loading) {
    return (
      <TopContainerBox>
        <div className="top__coverimg">
          <Skeleton variant="rect" width="100%" height={425} />
        </div>
        <WarrperChatBox>
          <FlexWidthBox width="50%" className="proposeMes">
            <CardHeader
              className={classes.card}
              avatar={<Skeleton variant="circle" width={40} height={40} />}
              title={<Skeleton height={6} width="80%" />}
              subheader={<Skeleton height={12} width="80%" />}
            />
          </FlexWidthBox>
          <FlexWidthBox width="50%" className="proposeMes">
            <CardHeader
              className={classes.card}
              avatar={<Skeleton variant="circle" width={40} height={40} />}
              title={<Skeleton height={6} width="80%" />}
              subheader={<Skeleton height={12} width="80%" />}
            />
          </FlexWidthBox>
        </WarrperChatBox>
      </TopContainerBox>
    );
  }

  return (
    <TopContainerBox>
      <div className="top__coverimg">
        {topInfo.coverimg && <img src={process.env.REACT_APP_IPFS + topInfo.coverimg} alt="itea-scan" />}
      </div>
      <WarrperChatBox>
        {topInfo.s_content && (
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="user_photo fl">
              <AvatarPro alt="img" hash={topInfo.s_avatar} className={classes.avatar} />
            </div>
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">{topInfo.s_name}</span>
                <span className="time fr color-gray">
                  <TimeWithFormat value={topInfo.s_date} />
                </span>
              </div>
              <p>{topInfo.s_content}</p>
            </div>
          </FlexWidthBox>
        )}
        {topInfo.r_content && (
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">{topInfo.r_name}</span>
                <span className="time fr color-gray">
                  <TimeWithFormat value={topInfo.r_date} />
                </span>
              </div>
              <p>{topInfo.r_content}</p>
            </div>
            <div className="user_photo fr">
              <AvatarPro alt="img" hash={topInfo.r_avatar} className={classes.avatar} />
            </div>
          </FlexWidthBox>
        )}
      </WarrperChatBox>
    </TopContainerBox>
  );
}
