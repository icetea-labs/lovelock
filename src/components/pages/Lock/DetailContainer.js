import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';

import { Helmet } from 'react-helmet';
import TextField from '@material-ui/core/TextField';
import { useSnackbar } from 'notistack';
import { rem, LeftBoxWrapper } from '../../elements/StyledUtils';
import { callView, makeLockName } from '../../../helper';

import { useTx } from '../../../helper/hooks';
import TopContrainer from './TopContainer';
import LeftContainer from './LeftContainer';
import RightContainer from './RightContainer';
// import { NotFound } from '../NotFound/NotFound';
import * as actions from '../../../store/actions';
import APIService from '../../../service/apiService';

import CommonDialog from '../../elements/CommonDialog';

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

export default function DetailContainer(props) {
  const { match, history } = props;
  let isOwner = false;
  let isContributor = false;
  let isView = false;
  const dispatch = useDispatch();
  const proIndex = parseInt(match.params.index, 10);
  let collectionId = parseInt(match.params.cid, 10);
  const invalidCollectionId = match.params.cid != null && isNaN(collectionId);
  if (isNaN(collectionId)) collectionId = null;

  const address = useSelector(state => state.account.address);
  const tx = useTx();
  const [loading, setLoading] = useState(true);
  const [proposeInfo, setProposeInfo] = useState(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colCreationCallback, setColCreationCallback] = useState();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let cancel = false;
    if (isNaN(proIndex) || invalidCollectionId) {
      history.push('/notFound');
    } else {
      callView('getMaxLocksIndex').then(async maxIndex => {
        if (proIndex > maxIndex) {
          history.push('/notFound');
        } else {
          APIService.getDetailLock(proIndex).then(lock => {
            if (cancel) return;
            setProposeInfo(lock);
            dispatch(actions.setTopInfo(lock));
          });
          APIService.getLocksForFeed(address).then(resp => {
            // set to redux
            dispatch(actions.setLocks(resp.locks));
            if (cancel) return;
            setLoading(false);
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

        // eslint-disable-next-line no-unused-expressions
        colCreationCallback && colCreationCallback(data);
      })
      .catch(err => {
        console.warn(err);
        enqueueSnackbar(err.message, { variant: 'error' });
      });
  };

  const renderHelmet = () => {
    const title = makeLockName(proposeInfo, 'Lovelock - ');
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

  const renderDetailPropose = () => (
    <>
      <BannerContainer>
        <ShadowBox>
          <TopContrainer proIndex={proIndex} />
        </ShadowBox>
      </BannerContainer>

      <LeftBoxWrapper>
        <div className="proposeColumn proposeColumn--left">
          <LeftContainer proIndex={proIndex} loading={loading} />
        </div>
        <div className="proposeColumn proposeColumn--right">
          <RightContainer
            proIndex={proIndex}
            collectionId={collectionId}
            handleNewCollection={handleNewCollection}
            isOwner={isOwner}
            isContributor={isContributor}
          />
        </div>
      </LeftBoxWrapper>

      {proposeInfo && renderHelmet()}
    </>
  );

  const renderNotFound = () => <>{history.push('/notFound')}</>;

  if (proposeInfo) {
    isOwner = address === proposeInfo.sender || address === proposeInfo.receiver;
    isContributor = proposeInfo.contributors.indexOf(address) !== -1;
    isView = proposeInfo.status === 1 && proposeInfo.isPrivate === false;

    proposeInfo.collections = proposeInfo.collections || [];
  }

  return (
    <>
      {proposeInfo && <>{isOwner || isView ? renderDetailPropose() : renderNotFound()}</>}
      {/* {pageErr && renderNotFound()} */}
      {dialogVisible && (
        <CommonDialog title="New Collection" okText="Create" onKeyReturn close={hideDialog} confirm={createCollection}>
          <TextField
            autoFocus
            required
            onChange={e => setColName(e.target.value.normalize())}
            label="Collection name"
            type="text"
            autoComplete="off"
          />
          <TextField
            onChange={e => setColDesc(e.target.value.normalize())}
            label="Description"
            type="text"
            style={{ marginTop: 16 }}
            fullWidth
          />
        </CommonDialog>
      )}
    </>
  );
}
