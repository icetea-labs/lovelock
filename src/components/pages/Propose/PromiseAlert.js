import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { CardMedia } from '@material-ui/core';
import CommonDialog from '../../elements/CommonDialog';
import { TagTitle } from './PuNewLock';
import { getAlias, sendTransaction } from '../../../helper';

const ImgView = styled.div`
  margin: 20px 0 20px;
`;

const PageView = styled.div`
  font-family: Montserrat;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-height: 16px;
  -webkit-line-clamp: 4; /* Write the number of lines you want to be displayed */
  -webkit-box-orient: vertical;
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

function PromiseAlert(props) {
  const { deny, close, accept, address, tokenAddress, index, proposes, enqueueSnackbar } = props;
  const [sender, setSender] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [promiseImg, setPromiseImg] = useState('');
  const hash = promiseImg;

  useEffect(() => {
    async function loadData() {
      const obj = proposes.find(item => item.id === index);
  
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
  }, [address, proposes, index]);

  async function cancelPromise(ind) {
    try {
      const funcName = 'cancelPropose';
      const params = [ind, 'no'];
      const result = await sendTransaction(funcName, params, { address, tokenAddress });

      if (result) {
        const message = 'Your proposes has been removed.';
        enqueueSnackbar(message, { variant: 'info' });
        close();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <React.Fragment>
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
          <PageView>{content}</PageView>
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
          <PageView>{content}</PageView>
        </CommonDialog>
      )}
    </React.Fragment>
  );
}

PromiseAlert.defaultProps = {
  index: 0,
  deny() {},
  accept() {},
  close() {},
};

export default withSnackbar(PromiseAlert);
