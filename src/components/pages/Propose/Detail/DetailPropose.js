import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';

import { Helmet } from 'react-helmet';
import { rem } from '../../../elements/StyledUtils';
import { callView, getTagsInfo, makeProposeName } from '../../../../helper';
import { useTx } from '../../../../helper/hooks';
import TopContrainer from './TopContainer';
import LeftContainer from './LeftContainer';
import RightContainer from './RightContainer';
import { NotFound } from '../../NotFound/NotFound';
import * as actions from '../../../../store/actions';

import CommonDialog from '../../../elements/CommonDialog';
import TextField from '@material-ui/core/TextField';
import { useSnackbar } from 'notistack';

window.prerenderReady = false;

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
      &--left {
        display: none;
      }
    }
  }
`;

export default function DetailPropose(props) {
  const { match } = props;
  let isOwner = false;
  let isView = false;
  const dispatch = useDispatch();
  const proIndex = parseInt(match.params.index, 10);
  let collectionId = parseInt(match.params.cid, 10);
  const invalidCollectionId = match.params.cid != null && isNaN(collectionId);
  if (isNaN(collectionId)) collectionId = null;

  const address = useSelector(state => state.account.address);
  const tx = useTx();

  const [proposeInfo, setProposeInfo] = useState(null);
  const [pageErr, setPageErr] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colCreationCallback, setColCreationCallback] = useState();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let cancel = false;

    if (isNaN(proIndex) || invalidCollectionId) {
      setPageErr(true);
    } else {
      callView('getProposes').then(async allPropose => {
        const proposeNum = allPropose.length - 1;
        if (proIndex > proposeNum) {
          setPageErr(true);
        } else {
          callView('getProposeByIndex', [proIndex]).then(async propose => {
            const proInfo = propose[0] || {};

            // add basic extra info
            proInfo.index = proIndex;
            proInfo.coverImg = proInfo.coverImg || 'QmXtwtitd7ouUKJfmfXXcmsUhq2nGv98nxnw2reYg4yncM';
            proInfo.isJournal = proInfo.sender === proInfo.receiver;
            proInfo.isCrush = proInfo.receiver === process.env.REACT_APP_BOT_LOVER;
            proInfo.isCouple = !proInfo.isJournal && !proInfo.isCrush;

            // add more detailed info
            await addInfoToPropose(proInfo);

            if (cancel) return;

            setProposeInfo(proInfo);
            dispatch(actions.setTopInfo(proInfo));
          });
        }
      });
    }

    return () => (cancel = true);
  }, [proIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const hideDialog = () => setDialogVisible(false);

  const handleNewCollection = callback => {
    setColCreationCallback(() => callback);
    setDialogVisible(true);
  };

  const createCollection = () => {
    hideDialog(); // prevent dialog over dialog

    const data = {
      name: colName,
    };

    const desc = colDesc.trim().normalize();
    if (desc) {
      data.description = desc;
    }

    tx.sendCommit('addLockCollection', proIndex, data)
      .then(r => {
        data.id = r.returnValue;
        proposeInfo.collections.push(data);
        // push to redux
        dispatch(actions.setTopInfo(proposeInfo));

        colCreationCallback && colCreationCallback(data);
      })
      .catch(err => {
        console.warn(err);
        enqueueSnackbar(err.message, { variant: 'error' });
      });
  };

  const renderHelmet = () => {
    const title = makeProposeName(proposeInfo, 'Lovelock - ');
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

  async function addInfoToPropose(pro) {
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
    }
    pro.publicKey = sender === address ? pro.r_publicKey : pro.s_publicKey;

    const info = pro.s_info;
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

  const renderDetailPropose = () => (
    <React.Fragment>
      <BannerContainer>
        <ShadowBox>
          <TopContrainer proIndex={proIndex} />
        </ShadowBox>
      </BannerContainer>

      <ProposeWrapper>
        <div className="proposeColumn proposeColumn--left">
          <LeftContainer proIndex={proIndex} />
        </div>
        <div className="proposeColumn proposeColumn--right">
          <RightContainer
            proIndex={proIndex}
            collectionId={collectionId}
            handleNewCollection={handleNewCollection}
            isOwner={isOwner}
          />
        </div>
      </ProposeWrapper>

      {proposeInfo && renderHelmet()}
    </React.Fragment>
  );

  const renderNotFound = () => <NotFound />;

  if (proposeInfo) {
    isOwner = address === proposeInfo.sender || address === proposeInfo.receiver;
    isView = proposeInfo.status === 1 && proposeInfo.isPrivate === false;

    proposeInfo.collections = proposeInfo.collections || [];
  }

  return (
    <React.Fragment>
      {proposeInfo && <React.Fragment>{isOwner || isView ? renderDetailPropose() : renderNotFound()}</React.Fragment>}
      {pageErr && renderNotFound()}
      {dialogVisible && (
        <CommonDialog title="New Collection" okText="Create" onKeyReturn close={hideDialog} confirm={createCollection}>
          <TextField
            autoFocus
            required
            onChange={e => setColName(e.target.value)}
            label="Collection name"
            type="text"
            autoComplete="off"
          />
          <TextField
            onChange={e => setColDesc(e.target.value)}
            label="Description"
            type="text"
            style={{ marginTop: 16 }}
            fullWidth
          />
        </CommonDialog>
      )}
    </React.Fragment>
  );
}
