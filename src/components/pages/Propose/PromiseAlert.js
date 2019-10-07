import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { CardMedia } from '@material-ui/core';
import CommonDialog from './CommonDialog';
import { TagTitle } from './Promise';
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
  const { deny, close, accept, address, index, propose, enqueueSnackbar } = props;
  const [sender, setSender] = useState('');
  const [info, setInfo] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const hash = (info && info.hash) || [];
  console.log('hash', hash);
  useEffect(() => {
    loaddata();
  }, []);

  async function loaddata() {
    const obj = propose.filter(item => item.id === index)[0];
    if (obj.status === 0) {
      const addr = address === obj.sender ? obj.receiver : obj.sender;
      const alias = await getAlias(addr);
      setSender(obj.sender);
      setInfo(obj.s_info);
      setContent(obj.s_content);
      setName(alias);
    }
  }

  async function cancelPromise(ind) {
    try {
      const funcName = 'cancelPropose';
      const params = [ind, 'no'];
      const result = await sendTransaction(funcName, params);
      // console.log('View result', result);
      if (result) {
        const message = 'Your propose has been removed.';
        enqueueSnackbar(message, { variant: 'info' });
        close();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      {address === sender ? (
        <CommonDialog
          title="Promise alert"
          okText="Cancel Promise"
          close={close}
          confirm={() => {
            cancelPromise(index);
          }}
        >
          <TagTitle>
            <span>You sent promise to </span>
            <span className="highlight">{name}</span>
          </TagTitle>
          <ImgView>
            {hash.length > 0 && <CardMediaCus image={process.env.REACT_APP_IPFS + hash[0]} title="promiseImg" />}
          </ImgView>
          <PageView>{content}</PageView>
        </CommonDialog>
      ) : (
        <CommonDialog
          title="Promise alert"
          okText="Accept"
          cancelText="Deny"
          close={close}
          cancel={deny}
          confirm={accept}
          isCancel
        >
          <TagTitle>
            <span className="highlight">{name}</span>
            <span> sent a promise to you</span>
          </TagTitle>
          <ImgView>
            {hash.length > 0 && <CardMediaCus image={process.env.REACT_APP_IPFS + hash[0]} title="promiseImg" />}
          </ImgView>
          <PageView>{content}</PageView>
        </CommonDialog>
      )}
    </div>
  );
}

PromiseAlert.defaultProps = {
  index: 0,
  deny() {},
  accept() {},
  close() {},
};

export default withSnackbar(PromiseAlert);
