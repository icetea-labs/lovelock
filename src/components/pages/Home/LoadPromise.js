import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, CardMedia, Typography } from '@material-ui/core';
import { AvatarPro } from '../../elements';
import { TimeWithFormat, getTagsInfo, getAlias } from '../../../helper';

import * as actions from '../../../store/actions';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(3),
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.15)',
  },
  media: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
  },
}));

function LoadPromise(props) {
  const { propose, address } = props;
  const [lastPropose, setLastPropose] = useState({});
  const [botInfo, setBotInfo] = useState({});
  const [sendInfo, setSendInfo] = useState({});
  const [displayName, setDisplayName] = useState('');
  const classes = useStyles();

  useEffect(() => {
    getLastPropose();
  }, []);

  async function getLastPropose() {
    if (address) {
      const lastOne = propose[propose.length - 1];
      try {
        const reps = await getTagsInfo(address);
        const ownerAva = reps.avatar;
        const ownerName = reps['display-name'];
        const obj = Object.assign({}, lastOne, { ownerAva, ownerName });
        const lastBotInfo = JSON.parse(obj.bot_info);
        const lastSendInfo = JSON.parse(obj.s_info);
        const addr = address === obj.sender ? obj.receiver : obj.sender;
        const name = await getAlias(addr);

        setDisplayName(name);
        setLastPropose(obj);
        setBotInfo(lastBotInfo);
        setSendInfo(lastSendInfo);
      } catch (e) {
        console.error(e);
      }
    }
  }

  // console.log('lastPropose', lastPropose);
  // console.log('sendInfo', sendInfo);
  // console.log('botInfo', botInfo);
  return (
    <Card key={lastPropose.id} className={classes.card}>
      <CardHeader
        avatar={<AvatarPro alt="img" hash={lastPropose.ownerAva} />}
        title={lastPropose.ownerName}
        subheader={<TimeWithFormat value={sendInfo.date} format="h:mm a DD MMM YYYY" />}
      />
      {lastPropose.status === 0 && (
        <CardContent>
          {address === lastPropose.sender ? (
            <Typography variant="h5" style={{ whiteSpace: 'pre-line' }} component="h3">
              <span>You have a propose with </span>
              <span className="proposeTarget">{displayName}</span>
            </Typography>
          ) : (
            <Typography variant="h5" style={{ whiteSpace: 'pre-line' }} component="h3">
              <span>You received a propose from </span>
              <span className="proposeTarget">{displayName}</span>
            </Typography>
          )}

          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }} component="p">
            {`"${lastPropose.s_content}"`}
          </Typography>
        </CardContent>
      )}
      {lastPropose.status === 1 && (
        <CardContent>
          {address === lastPropose.sender ? (
            <Typography variant="h5" style={{ whiteSpace: 'pre-line' }} component="h3">
              <span>You have a propose with </span>
              <span className="proposeTarget">{displayName}</span>
            </Typography>
          ) : (
            <Typography variant="h5" style={{ whiteSpace: 'pre-line' }} component="h3">
              <span>You received a propose from </span>
              <span className="proposeTarget">{displayName}</span>
            </Typography>
          )}

          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }} component="p">
            {`"${lastPropose.s_content}"`}
          </Typography>
        </CardContent>
      )}
      {lastPropose.status === 2 && (
        <CardContent>
          {address === lastPropose.sender ? (
            <Typography variant="h5" style={{ whiteSpace: 'pre-line' }} component="h3">
              <span>Your propose has been rejected by </span>
              <span className="proposeTarget">{displayName}</span>
            </Typography>
          ) : (
            <Typography variant="h5" style={{ whiteSpace: 'pre-line' }} component="h3">
              <span>You rejected a propose from </span>
              <span className="proposeTarget">{displayName}</span>
            </Typography>
          )}

          <Typography variant="body2" style={{ whiteSpace: 'pre-line' }} component="p">
            {`"${lastPropose.s_content}"`}
          </Typography>
        </CardContent>
      )}
      {sendInfo.hash && (
        <CardMedia className={classes.media} image={process.env.REACT_APP_IPFS + sendInfo.hash} title="img" />
      )}
    </Card>
  );
}

const mapStateToProps = state => {
  const { loveinfo, account } = state;
  return {
    propose: loveinfo.propose,
    address: account.address,
    privateKey: account.privateKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadPromise);
