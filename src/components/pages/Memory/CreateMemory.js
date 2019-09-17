import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { ButtonPro } from '../../elements/Button';
import styled from 'styled-components';
import AddInfoMessage from '../../elements/AddInfoMessage';
import * as actions from '../../../store/actions';
import { saveToIpfs, sendTransaction } from '../../../helper';
// import { rem } from '../../elements/StyledUtils';
import Grid from '@material-ui/core/Grid';
import AvatarPro from '../../elements/AvatarPro';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import { encodeWithPublicKey } from '../../../helper';

const GrayLayout = styled.div`
  background: ${props => props.grayLayout && 'rgba(0, 0, 0, 0.5)'};
  transition: background 0.3s ease;
  position: ${props => props.grayLayout && 'fixed'};
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1;
`;

const CreatePost = styled.div`
  position: relative;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 2 !important;
  margin-bottom: 24px;
`;
const ShadowBox = styled.div`
  padding: 30px;
  padding-bottom: 5px;
  border-radius: 5px;
  background: #fff;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
`;
const useStyles = makeStyles(theme => ({
  margin: {
    // margin: theme.spacing(1),
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 10,
  },
  btShare: {
    width: 254,
    height: 46,
    borderRadius: 23,
  },
  selectStyle: {
    minWidth: 110,
    height: 36,
    fontSize: 12,
    color: '#8250c8',
  },
  selectIcon: {
    width: 24,
    height: 24,
    color: '#8250c8',
    marginRight: theme.spacing(1),
  },
  btBox: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '25px !important',
  },
}));

const BootstrapInput = withStyles(theme => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 23,
    position: 'relative',
    border: '1px solid #8250c8',
    padding: '10px 18px 11px 18px',
    boxSizing: 'border-box',
    '&:focus': {
      borderRadius: 23,
      borderColor: '#8250c8',
    },
  },
}))(InputBase);

const BootstrapTextField = withStyles(theme => ({
  root: {
    fontSize: 16,
    paddingLeft: theme.spacing(1),
    borderColor: '#8250c8',
    // background: 'red',
  },
}))(InputBase);

export default function CreateMemory(props) {
  const { reLoadMemory } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const layoutRef = React.createRef();
  const avatar = useSelector(state => state.account.avatar);
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);
  // const propose = useSelector(state => state.loveinfo.propose);
  const [filePath, setFilePath] = useState(null);
  const [memoryContent, setMemoryContent] = useState('');
  const [grayLayout, setGrayLayout] = useState(false);
  const [date, setDate] = useState(new Date());
  const [privacy, setPrivacy] = React.useState(0);

  function setGLoading(value) {
    dispatch(actions.setLoading(value));
  }

  function setNeedAuth(value) {
    dispatch(actions.setNeedAuth(value));
  }

  function memoryOnFocus(e) {
    if (!grayLayout) setGrayLayout(true);
  }
  function clickLayout(e) {
    e.target === layoutRef.current && setGrayLayout(false);
  }
  function memoryChange(e) {
    setMemoryContent(e.target.value);
  }
  function handleChangePrivacy(event) {
    setPrivacy(event.target.value);
  }
  function onChangeDate(value) {
    setDate(value);
  }
  function onChangeMedia(value) {
    setFilePath(value);
  }

  async function handleShareMemory(memoryContent, date, file) {
    if (!privateKey) {
      // console.log('privateKey', privateKey);
      setNeedAuth(true);
      return;
    }
    setGLoading(true);
    setTimeout(async () => {
      const { proIndex } = props;
      let hash = '';
      if (file) hash = await saveToIpfs(file);
      const method = 'addMemory';
      const info = JSON.stringify({ date, hash });
      let params = [];
      if (privacy) {
        // const currentPropose = propose.filter(item => item.id === proIndex)[0] || [];
        // console.log('info', memoryContent, info);
        // console.log('publicKey', currentPropose.publicKey);
        const newContent = await encodeWithPublicKey(memoryContent, privateKey, publicKey);
        const newInfo = await encodeWithPublicKey(info, privateKey, publicKey);
        // console.log('newContent', newContent);
        // console.log('newInfo', newInfo);
        params = [proIndex, !!privacy, newContent, newInfo];
      } else {
        params = [proIndex, !!privacy, memoryContent, info];
      }
      // console.log('params', params);
      const result = await sendTransaction(method, params);
      if (result) {
        reLoadMemory(proIndex);
      }
      setGLoading(false);
      setGrayLayout(false);
      //reset input value
      setFilePath('');
      setDate(new Date());
      setMemoryContent('');
      setPrivacy(0);
    }, 100);
  }

  return (
    <React.Fragment>
      <GrayLayout grayLayout={grayLayout} ref={layoutRef} onClick={clickLayout} />
      <CreatePost>
        <ShadowBox>
          <Grid container direction="column" spacing={3}>
            <Grid item>
              <Grid container wrap="nowrap" spacing={1}>
                <Grid item>
                  <AvatarPro alt="img" hash={avatar} className={classes.avatar} />
                </Grid>
                <Grid item xs={12}>
                  <BootstrapTextField
                    rows={3}
                    rowsMax={10}
                    fullWidth
                    multiline
                    value={memoryContent}
                    placeholder="Describe your Memory...."
                    onChange={memoryChange}
                    onFocus={memoryOnFocus}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <AddInfoMessage
                files={filePath}
                date={date}
                grayLayout={grayLayout}
                onChangeDate={onChangeDate}
                onChangeMedia={onChangeMedia}
              />
            </Grid>
            {grayLayout && (
              <Grid item classes={{ root: classes.btBox }}>
                <Select
                  native
                  value={privacy}
                  onChange={handleChangePrivacy}
                  classes={{
                    root: classes.selectStyle,
                    icon: classes.selectIcon,
                  }}
                  input={<BootstrapInput name="privacy" id="outlined-privacy" />}
                >
                  <option value={0}>Public</option>
                  <option value={1}>Private</option>
                </Select>
                <ButtonPro
                  type="submit"
                  onClick={() => {
                    handleShareMemory(memoryContent, date, filePath);
                  }}
                  className={classes.btShare}
                >
                  Share
                </ButtonPro>
              </Grid>
            )}
          </Grid>
        </ShadowBox>
      </CreatePost>
    </React.Fragment>
  );
}
