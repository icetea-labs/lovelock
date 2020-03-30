import React from 'react';
import styled from 'styled-components';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
import { withSnackbar } from 'notistack';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Divider from '@material-ui/core/Divider';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import WarningIcon from '@material-ui/icons/Warning';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { FormattedMessage } from 'react-intl';

import * as actions from '../../store/actions';
import {
  saveFileToIpfs,
  saveBufferToIpfs,
  applyRotation,
  imageResize,
  handleError,
  getUserSuggestions,
} from '../../helper';
import { ensureToken, sendTransaction } from '../../helper/hooks';
import AddInfoMessage from './AddInfoMessage';
import CommonDialog from './CommonDialog';
import { FlexBox } from './StyledUtils';
import ImageCrop from './ImageCrop';
import { AvatarPro } from './AvatarPro';
import appConstants from '../../helper/constants';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  textMulti: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  devidePrm: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  avatar: {
    width: 100,
    height: 100,
  },
  avatarSug: {
    width: 40,
    height: 40,
  },
}));

const ColoredRadio = withStyles({
  root: {
    color: '#fe8dc3',
    '&$checked': {
      color: 'fe8dc3',
    },
  },
  checked: {},
})(props => <Radio color="default" {...props} />);

function TextFieldPlaceholder(props) {
  const classes = useStyles();
  return <TextField className={classes.textField} {...props} />;
}

function TextFieldMultiLine(props) {
  const classes = useStyles();
  return <TextField className={classes.textMulti} {...props} />;
}

function DividerCus(props) {
  const classes = useStyles();
  return <Divider className={classes.devidePrm} {...props} />;
}

function AvatarProCus(props) {
  const classes = useStyles();
  return <AvatarPro className={classes.avatar} {...props} />;
}

function AvatarProSug(props) {
  const classes = useStyles();
  return <AvatarPro className={classes.avatarSug} {...props} />;
}

export const TagTitle = styled.div`
  width: 100%;
  height: 18px;
  font-family: Montserrat;
  font-size: 16px;
  font-weight: 500;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #141927;
  .highlight {
    color: #8250c8;
  }
  &.prmContent {
  }
`;

const PreviewContainter = styled.div`
  display: flex;
  flex-direction: row;
  -webkit-box-pack: justify;
  padding: 30px 0 0 0;
  font-size: 14px;
  cursor: pointer;
  .upload_img input[type='file'] {
    font-size: 100px;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
  }
  .upload_img {
    position: relative;
    overflow: hidden;
    display: inline-block;
    cursor: pointer;
    &:hover .changeImg {
      display: block;
    }
  }
  .changeImg {
    cursor: pointer;
    position: absolute;
    display: none;
    height: 50px;
    top: 50px;
    left: 0;
    right: 0;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 80%;
    line-height: 2;
    overflow: hidden;
    border-bottom-left-radius: 600px;
    border-bottom-right-radius: 600px;
  }
  .fileInput {
    width: 120px;
    height: 50px;
    padding: 2px;
    cursor: pointer;
  }
  .imgPreview {
    text-align: center;
    margin-right: 15px;
    height: 100px;
    width: 100px;
    border: 1px solid #eddada8f;
    cursor: pointer;
    img {
      width: 100px;
      height: 100px;
      cursor: pointer;
    }
  }
  .previewAvaDefault {
    cursor: pointer;
    color: #736e6e;
  }
`;

const RightBotInfo = styled.div`
  margin-left: 8px;
`;
const WarningPass = styled.div`
  .warningSnackbar {
    background-color: #fe7;
    box-shadow: none;
    margin-top: 8px;
    /* max-width: 400px; */
  }
  .warningMessage {
    display: flex;
    align-items: center;
  }
  .warningIcon {
    margin-right: 16px;
    color: #d90;
  }
  .warningText {
    color: #333;
    font-style: italic;
    font-size: 1.1em;
  }
`;
class PuNewLock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      partner: '',
      promiseStm: '',
      date: Date.parse(new Date()),
      file: '',
      value: '',
      suggestions: [],
      lockType: 'lock',
      cropFile: '',
      isOpenCrop: false,
      avatar: '/static/img/no-avatar.jpg',
      originFile: '',
      isJournal: false,
    };
  }

  componentWillUnmount() {
    this.timeoutHanle1 && clearTimeout(this.timeoutHanle1);
    this.timeoutHanle2 && clearTimeout(this.timeoutHanle2);
  }

  onChangeDate = date => {
    this.setState({ date });
  };

  onChangeMedia = file => {
    this.setState({ file });
  };

  async getSuggestions(value) {
    const users = await getUserSuggestions(value);

    this.setState({
      suggestions: users,
    });
  }

  getSuggestionValue = suggestion => {
    return `@${suggestion.nick}`;
  };

  promiseStmChange = e => {
    const val = e.target.value;
    this.setState({
      promiseStm: val.normalize(),
    });
  };

  renderSearchMatch(parts, isNick) {
    return (
      <>
        {parts.map((part, index) => {
          const className = part.highlight ? 'highlight' : null;
          return (
            <span className={className} key={index}>
              {(isNick && part.highlight ? '@' : '') + part.text}
            </span>
          );
        })}
      </>
    );
  }

  renderSuggestion = (suggestion, { query }) => {
    const isNick = query.startsWith('@');
    const searchFor = isNick ? query.slice(1) : query;
    const suggestionText = isNick ? suggestion.nick : suggestion.display;
    const suggestionAva = suggestion.avatar;
    const matches = AutosuggestHighlightMatch(suggestionText, searchFor);
    const parts = AutosuggestHighlightParse(suggestionText, matches);
    return (
      <span className="suggestion-content">
        <AvatarProSug hash={suggestionAva} />
        <div className="text">
          <span className="name">{isNick ? suggestion.display : this.renderSearchMatch(parts, false)}</span>
          <span className="nick">{isNick ? this.renderSearchMatch(parts, true) : '@' + suggestion.nick}</span>
        </div>
      </span>
    );
  };

  onPartnerChange = (event, { newValue }) => {
    const name = newValue.substring(1);
    const { address } = this.props;
    const { suggestions } = this.state;
    let addr = '';
    if (suggestions) {
      const seletedItem = suggestions.filter(item => item.nick === name);
      if (seletedItem && seletedItem.length > 0) {
        addr = seletedItem[0].address;
      }
    }
    if (addr === address) {
      this.setState({
        isJournal: true,
      });
    }
    this.setState({
      value: newValue,
      partner: addr,
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.getSuggestions(value);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  handleCheckChange = e => {
    document.activeElement.blur();

    const lockType = e.target.value;

    if (lockType === 'crush') {
      this.setState({
        lockType,
        partner: process.env.REACT_APP_BOT_LOVER,
      });
    } else {
      this.setState({
        lockType,
        value: '',
        partner: '',
      });
    }
  };

  handleUsername = event => {
    const key = event.currentTarget.name;
    const val = event.currentTarget.value;

    this.setState({ [key]: val.normalize() });
  };

  handleImageChange = event => {
    event.preventDefault();
    const orFiles = Array.from(event.target.files);
    if (orFiles.length > 0) {
      this.setState({
        originFile: orFiles,
        isOpenCrop: true,
      });
    } else {
      this.setState({
        isOpenCrop: false,
      });
    }
  };

  closeCrop = () => {
    this.setState({
      isOpenCrop: false,
    });
  };

  acceptCrop = e => {
    this.closeCrop();
    this.setState({ cropFile: e.cropFile, avatar: e.avaPreview });
  };

  closeJournal = () => {
    this.setState({ isJournal: false, value: '', partner: '' });
  };

  createJournal = () => {
    this.setState({
      value: '',
      lockType: 'journal',
      isJournal: false,
    });
  };

  onKeyEsc = () => {
    if (!this.dialogShown && !this.state.isJournal) {
      this.props.close();
    }
  };

  onDialogToggle = value => {
    this.dialogShown = value;
  };

  async createLock() {
    const { setLoading, enqueueSnackbar, close, address } = this.props;
    const { promiseStm, date, file, firstname, lastname, cropFile, lockType, lockName, botReply } = this.state;

    let { partner } = this.state;
    let hash = [];
    let botInfo;

    try {
      if (lockType === 'lock') {
        if (!partner) {
          const message = 'Please choose your partner.';
          enqueueSnackbar(message, { variant: 'error' });
          setLoading(false);
          return;
        }
      } else if (lockType === 'crush') {
        partner = process.env.REACT_APP_BOT_LOVER;
        if (!firstname) {
          const message = 'Please enter your crush first name.';
          enqueueSnackbar(message, { variant: 'error' });
          return;
        }
        if (!lastname) {
          const message = 'Please enter your crush last name.';
          enqueueSnackbar(message, { variant: 'error' });
          return;
        }
        if (!cropFile) {
          const message = 'Please choose avatar of your crush.';
          enqueueSnackbar(message, { variant: 'error' });
          return;
        }
        if (!botReply) {
          const message = 'Please enter the reply from your crush.';
          enqueueSnackbar(message, { variant: 'error' });
          return;
        }
        botInfo = { firstname, lastname, botReply };
      } else if (lockType === 'journal') {
        partner = address;
      } else {
        enqueueSnackbar('Invalid lock type.', { variant: 'error' });
        return;
      }

      if (!promiseStm) {
        const message = `Please input ${this.getMessage('messageLabel')}`;
        enqueueSnackbar(message, { variant: 'error' });
        return;
      }

      const uploadThenSendTx = async opts => {
        setLoading(true);

        if (cropFile) {
          const newFile = await applyRotation(cropFile[0], 1, 500);
          const saveFile = imageResize(cropFile[0], newFile);
          botInfo.botAva = await saveFileToIpfs(saveFile);
        }

        if (file) {
          hash = await saveBufferToIpfs(file);
        }

        const info = { date, hash, lockName };

        return await sendTransaction(opts || this.props, 'createLock', promiseStm, partner, info, botInfo);
      };

      const result = await ensureToken(this.props, uploadThenSendTx);

      if (result) {
        enqueueSnackbar(this.getMessage('sent'), { variant: 'success' });
        setLoading(false);
        close();

        // redirect to the new lock
        this.props.history.push(`/lock/${result.returnValue}`);
      }
    } catch (err) {
      console.log(err);
      const msg = handleError(err, 'creating new lock.');
      enqueueSnackbar(msg, { variant: 'error' });
      setLoading(false);
    }
  }

  getMessage(id) {
    const { lockType } = this.state;
    return appConstants.textByLockTypes[lockType][id];
  }

  render() {
    const { close, isApproved, language } = this.props;
    const {
      // partner,
      // promiseStm,
      date,
      file,
      suggestions,
      value,
      lockType,
      isOpenCrop,
      avatar,
      originFile,
      isJournal,
    } = this.state;
    const ja = 'ja';

    const inputProps = {
      placeholder: language === ja ? '検索する文字を入力してください' : 'type some letters to search',
      value,
      onChange: this.onPartnerChange,
    };

    return (
      <>
        <CommonDialog
          title={<FormattedMessage id="newLock.newLock" />}
          okText={this.getMessage('okButton')}
          close={close}
          onKeyEsc={this.onKeyEsc}
          confirm={() => {
            this.createLock();
          }}
        >
          <TagTitle className="prmContent">
            <FormattedMessage id="newlock.lockWith" />
          </TagTitle>

          <RadioGroup value={lockType} onChange={this.handleCheckChange} row>
            <FormControlLabel
              control={<ColoredRadio />}
              value="lock"
              label={<FormattedMessage id="newLock.member" />}
            />
            <FormControlLabel
              control={<ColoredRadio />}
              value="crush"
              label={<FormattedMessage id="newLock.crush" />}
            />
            <FormControlLabel
              control={<ColoredRadio />}
              value="journal"
              label={<FormattedMessage id="newLock.journal" />}
            />
          </RadioGroup>

          {lockType === 'lock' && (
            <div>
              <Autosuggest
                id="suggestPartner"
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={inputProps}
              />
            </div>
          )}

          {lockType === 'journal' && (
            <div>
              <TextFieldPlaceholder
                label={<FormattedMessage id="newLock.journalName" />}
                fullWidth
                onChange={this.handleUsername}
                name="lockName"
                inputProps={{ maxLength: 28 }}
              />
            </div>
          )}

          {lockType === 'crush' && (
            <FlexBox>
              <PreviewContainter>
                <div className="upload_img">
                  <AvatarProCus src={avatar} />
                  <div className="changeImg">
                    <input
                      className="fileInput"
                      type="file"
                      value=""
                      onChange={this.handleImageChange}
                      accept="image/jpeg,image/png"
                    />
                    <CameraAltIcon />
                  </div>
                </div>
              </PreviewContainter>
              <RightBotInfo>
                <TextFieldPlaceholder
                  label={<FormattedMessage id="newLock.crushFirstName" />}
                  fullWidth
                  onChange={this.handleUsername}
                  name="firstname"
                  validators={['required']}
                  // margin="normal"
                />
                <TextFieldPlaceholder
                  label={<FormattedMessage id="newLock.crushLastName" />}
                  fullWidth
                  onChange={this.handleUsername}
                  name="lastname"
                  validators={['required']}
                  // margin="normal"
                />
                <TextFieldPlaceholder
                  label={<FormattedMessage id="newLock.crushReply" />}
                  fullWidth
                  onChange={this.handleUsername}
                  name="botReply"
                  validators={['required']}
                />
              </RightBotInfo>
            </FlexBox>
          )}
          <DividerCus />
          <TagTitle className="prmContent">{this.getMessage('messageLabel')}</TagTitle>
          <TextFieldMultiLine
            id="outlined-multiline-static"
            placeholder={this.getMessage('messagePlaceholder')}
            multiline
            fullWidth
            rows="4"
            variant="outlined"
            onChange={this.promiseStmChange}
          />
          <AddInfoMessage
            files={file}
            date={date}
            onChangeDate={this.onChangeDate}
            onChangeMedia={this.onChangeMedia}
            coverPhotoMode
            hasParentDialog
            onDialogToggle={this.onDialogToggle}
            photoButtonText={<FormattedMessage id="newLock.btnCover" />}
          />
          <WarningPass>
            <SnackbarContent
              className="warningSnackbar"
              message={
                isApproved ? (
                  <span className="warningMessage">
                    <WarningIcon className="warningIcon" />
                    <span className="warningText">
                      <FormattedMessage id="newLock.warning" />
                    </span>
                  </span>
                ) : (
                  <span className="warningMessage">
                    <WarningIcon className="warningIcon" />
                    <span className="warningText">
                      <a
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="http://bit.ly/LoveLock-AAR"
                      >
                        <FormattedMessage id="newLock.activationForm" />
                      </a>
                      <FormattedMessage id="newLock.activationGoal" />
                    </span>
                  </span>
                )
              }
            />
          </WarningPass>
        </CommonDialog>
        {isOpenCrop && (
          <ImageCrop close={this.closeCrop} accept={this.acceptCrop} originFile={originFile} hasParentDialog />
        )}
        {isJournal && (
          <CommonDialog
            title="Journal"
            okText="Yes, let's create"
            cancelText="Cancel"
            close={this.closeJournal}
            cancel={this.closeJournal}
            confirm={this.createJournal}
            hasParentDialog
          >
            <TagTitle>
              <span>
                <FormattedMessage id="newLock.journalSearch" />
              </span>
            </TagTitle>
          </CommonDialog>
        )}
      </>
    );
  }
}

Promise.defaultProps = {
  send() {},
  close() {},
};

const mapStateToProps = state => {
  return {
    locks: state.loveinfo.locks,
    address: state.account.address,
    tokenKey: state.account.tokenKey,
    tokenAddress: state.account.tokenAddress,
    isApproved: state.account.isApproved,
    language: state.globalData.language,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLoading: value => {
      dispatch(actions.setLoading(value));
    },
    dispatch,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(withSnackbar(PuNewLock));
