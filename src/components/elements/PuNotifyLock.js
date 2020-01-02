import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { CardMedia } from '@material-ui/core';
import CommonDialog from './CommonDialog';
import { TagTitle } from './PuNewLock';
import { getAlias } from '../../helper';
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
  const [name, setName] = useState('');
  const [promiseImg, setPromiseImg] = useState('');
  const hash = promiseImg;
  const tx = useTx();

  useEffect(() => {
    async function loadData() {
      const obj = locks.find(item => item.id === index);

      if (obj.status === 0) {
        const addr = address === obj.sender ? obj.receiver : obj.sender;
        const alias = await getAlias(addr);
        setSender(obj.sender);
        setContent(obj.s_content);
        setPromiseImg(obj.coverImg);
        setName(alias);
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
          title="Lock alert"
          okText="Cancel Lock"
          close={close}
          confirm={() => {
            cancelPromise(index);
          }}
        >
          <TagTitle>
            <span>You sent lock to </span>
            <span className="highlight">{name}</span>
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
        <CommonDialog title="Lock alert" okText="Accept" confirm={accept} cancelText="Deny" cancel={deny} close={close}>
          <TagTitle>
            <span className="highlight">{name}</span>
            <span> sent a lock to you</span>
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
