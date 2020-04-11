import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { CardMedia } from '@material-ui/core';
import CommonDialog from './CommonDialog';
import { TagTitle } from './PuNewLock';
import { getAliasAndTags } from '../../helper/account';
import { useTx } from '../../helper/hooks';
import ReadMore from '../elements/ReaMore';

const ImgView = styled.div`
  margin: 20px 0 20px;
`;

const PageView = styled.div`
  font-family: Montserrat;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-height: 16px;
  /* -webkit-line-clamp: 4; Write the number of lines you want to be displayed */
  -webkit-box-orient: vertical;
  .read-more__button {
    font-size: 14px;
  }

`;

const useStyles = makeStyles(() => ({
  media: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
    backgroundSize: 'contain',
  },
}));

function CardMediaCus(props) {
  const classes = useStyles();
  return <CardMedia className={classes.media} {...props} />;
}

function PuNotifyLock(props) {
  const { deny, close, accept, address, index, locks, enqueueSnackbar } = props;
  const [sender, setSender] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [promiseImg, setPromiseImg] = useState('');
  const hash = promiseImg;
  const tx = useTx();

  useEffect(() => {
    async function loadData() {
      const obj = locks.find(item => item.id === index);

      if (obj.status === 0) { // pending
        const addr = address === obj.sender ? obj.receiver : obj.sender;
        const [username, tags] = await getAliasAndTags(addr);
        const displayName = tags['display-name']
        setSender(obj.sender);
        setContent(obj.s_content);
        setPromiseImg(obj.coverImg);
        setUsername(username);
        setDisplayName(displayName);
      }
    }

    loadData();
  }, [address, locks, index]);

  async function cancelPromise(index) {
    try {
      const result = await tx.sendCommit('cancelLock', index, 'no');

      if (result) {
        const message = 'Lock canceled.';
        enqueueSnackbar(message, { variant: 'success', preventDuplicate: true });
        close();
      }
    } catch (error) {
      console.error(error);
    }
  }

  // useEffect(() => {
  //   console.log('mounted width - ', window.getComputedStyle(this.wrapper).getPropertyValue('width'));
  // }, []);

  // function getWrapperWidth() {
  //   if (this.wrapper) {
  //     console.log('get wrapper width', window.getComputedStyle(this.wrapper).getPropertyValue('width'));
  //   } else {
  //     console.log('get wrapper - no wrapper');
  //   }
  // }

  return (
    <>
      {address === sender ? (
        <CommonDialog
          title="Sent Lock Request"
          okText="Cancel Lock"
          close={close}
          confirm={() => {
            cancelPromise(index);
          }}
        >
          <TagTitle>
            <span>You sent this lock request to </span>
            <a className="highlight" target="_blank" rel="noopener noreferrer" href={`/u/${username}`}>{displayName}</a>
          </TagTitle>
          <ImgView>
            {hash.length > 0 && <CardMediaCus image={process.env.REACT_APP_IPFS + hash} title="lockImg" />}
          </ImgView>
          <PageView>
            {content.length > 200 ? (
              <ReadMore text={content} numberOfLines={4} lineHeight={1.4} showLessButton readMoreCharacterLimit={200} />
            ) : (
              content
            )}
          </PageView>
        </CommonDialog>
      ) : (
        <CommonDialog title="Received Lock Request" okText="Accept" confirm={accept} cancelText="Deny" cancel={deny} close={close}>
          <TagTitle>
            <a className="highlight" target="_blank" rel="noopener noreferrer" href={`/u/${username}`}>{displayName}</a>
            <span> requests to lock with you.</span>
          </TagTitle>
          <ImgView>
            {hash.length > 0 && <CardMediaCus image={process.env.REACT_APP_IPFS + hash} title="lockImg" />}
          </ImgView>
          <PageView>
            {content.length > 200 ? (
              <ReadMore text={content} numberOfLines={4} lineHeight={1.4} showLessButton readMoreCharacterLimit={200} />
            ) : (
              content
            )}
          </PageView>
        </CommonDialog>
      )}
    </>
  );
}

PuNotifyLock.defaultProps = {
  index: 0,
  deny() {},
  accept() {},
  close() {},
};
export default withSnackbar(PuNotifyLock);
