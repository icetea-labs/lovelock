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
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import WarningIcon from '@material-ui/icons/Warning';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import * as actions from '../../store/actions';
import { getAliasContract } from '../../service/tweb3';
import {
  saveFileToIpfs,
  saveBufferToIpfs,
  tryStringifyJson,
  getTagsInfo,
  applyRotation,
  imageResize,
  handleError,
} from '../../helper';
import { ensureToken, sendTransaction } from '../../helper/hooks';
import AddInfoMessage from './AddInfoMessage';
import CommonDialog from './CommonDialog';
import { FlexBox } from './StyledUtils';
import ImageCrop from './ImageCrop';
import { AvatarPro } from './AvatarPro';

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
    marginBottom: '12px',
  },
  avatar: {
    width: 100,
    height: 100,
  },
  avatarSug: {
    width: 30,
    height: 30,
  },
}));

const CustCheckbox = withStyles({
  root: {
    color: '#fe8dc3',
    '&$checked': {
      color: 'fe8dc3',
    },
  },
  checked: {},
})(props => <Checkbox color="default" {...props} />);

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
  .prmContent {
    margin-top: 8px;
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
      checked: false,
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
    let escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue.length < 3) {
      this.setState({ suggestions: [] });
      return;
    }

    let people = [];
    escapedValue = escapedValue.substring(escapedValue.indexOf('@') + 1);
    const regex = new RegExp(`\\b${escapedValue}`, 'i');

    const peopleAva = [];

    try {
      const result = await getAliasContract()
        .methods.query(`account.${escapedValue}`)
        .call();
      people = Object.keys(result).map(key => {
        const nick = key.substring(key.indexOf('.') + 1);
        return { nick, address: result[key].address };
      });
    } catch (err) {
      console.error(tryStringifyJson(err));
    }

    // people = people.filter(person => person.address !== props.address);
    people = people.filter(person => regex.test(this.getSuggestionValue(person)));
    people = people.slice(0, 10);
    for (let i = 0; i < people.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await getTagsInfo(people[i].address);
      if (resp && resp.avatar) {
        peopleAva.push(resp.avatar);
      }
    }
    for (let i = 0; i < people.length; i++) {
      Object.assign(people[i], { avatar: peopleAva[i] });
    }
    this.setState({
      suggestions: people,
    });
  }

  getSuggestionValue = suggestion => {
    return `@${suggestion.nick}`;
  };

  partnerChange = e => {
    const val = e.target.value;
    this.setState({
      partner: val.normalize(),
    });
  };

  promiseStmChange = e => {
    const val = e.target.value;
    this.setState({
      promiseStm: val.normalize(),
    });
  };

  escapeRegexCharacters = str => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  renderSuggestion = (suggestion, { query }) => {
    const suggestionText = `${suggestion.nick}`;
    const suggestionAva = suggestion.avatar;
    const matches = AutosuggestHighlightMatch(suggestionText, query);
    const parts = AutosuggestHighlightParse(suggestionText, matches);
    return (
      <span className="suggestion-content">
        <AvatarProSug hash={suggestionAva} />
        <span className="name">
          {parts.map((part, index) => {
            const className = part.highlight ? 'highlight' : null;
            return (
              <span className={className} key={index}>
                {part.text}
              </span>
            );
          })}
        </span>
      </span>
    );
  };

  onPartnerChange = (event, { newValue }) => {
    const name = newValue.substring(1);
    const { address } = this.props;
    const { suggestions } = this.state;
    let add = '';
    if (suggestions) {
      const seletedItem = suggestions.filter(item => item.nick === name);
      if (seletedItem && seletedItem.length > 0) {
        add = seletedItem[0].address;
      }
    }
    if (add === address) {
      this.setState({
        isJournal: true,
      });
    }
    this.setState({
      value: newValue,
      partner: add,
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

    const check = e.target.checked;

    if (check) {
      this.setState({
        checked: check,
        okText: 'Create',
        partner: process.env.REACT_APP_BOT_LOVER,
      });
    } else {
      this.setState({
        checked: false,
        okText: 'Send',
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
    // const { locks, enqueueSnackbar } = this.props;
    let message = '';
    // for (let i = 0; i < locks.length; i++) {
    //   if (locks[i].sender === locks[i].receiver) {
    //     message = 'You already had a journal and cannot create one more.';
    //     enqueueSnackbar(message, { variant: 'error' });
    //   }
    // }

    if (message) {
      this.closeJournal();
    } else {
      this.setState({ isJournal: false });
    }
  };

  onKeyEsc = () => {
    if (!this.dialogShown && !this.state.isJournal) {
      this.props.close();
    }
  };

  onDialogToggle = value => {
    this.dialogShown = value;
  };

  async createLock(partner, promiseStm, date, file) {
    const { setLoading, enqueueSnackbar, close } = this.props;
    const { firstname, lastname, cropFile, checked, botReply } = this.state;
    let hash = [];

    // this.timeoutHanle1 = setTimeout(async () => {
    try {
      if (!partner) {
        const message = 'Please choose your partner.';
        enqueueSnackbar(message, { variant: 'error' });
        setLoading(false);
        return;
      }
      if (!promiseStm) {
        const message = 'Please input your lock.';
        enqueueSnackbar(message, { variant: 'error' });
        return;
      }

      let botInfo;
      if (checked) {
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
      }
      const uploadThenSendTx = async () => {
        setLoading(true);

        if (cropFile) {
          const newFile = await applyRotation(cropFile[0], 1, 500);
          const saveFile = imageResize(cropFile[0], newFile);
          botInfo.botAva = await saveFileToIpfs(saveFile);
        }

        if (file) {
          hash = await saveBufferToIpfs(file);
        }

        const info = { date, hash };
        return await sendTransaction(this.props, 'createLock', promiseStm, partner, info, botInfo);
      };

      const result = await ensureToken(this.props, uploadThenSendTx);

      // this.timeoutHanle2 = setTimeout(() => {
      if (result) {
        const message = 'Your lock sent successfully.';
        enqueueSnackbar(message, { variant: 'success' });
        setLoading(false);
        close();
      }
      // }, 50);
    } catch (err) {
      const msg = handleError(err, 'sending newlock');
      enqueueSnackbar(msg, { variant: 'error' });
      setLoading(false);
    }
    // }, 100);
  }

  render() {
    const { close } = this.props;
    const {
      partner,
      promiseStm,
      date,
      file,
      suggestions,
      value,
      checked,
      isOpenCrop,
      avatar,
      originFile,
      isJournal,
    } = this.state;

    const inputProps = {
      placeholder: '@partner',
      value,
      onChange: this.onPartnerChange,
      autoFocus: true,
    };

    return (
      <>
        <CommonDialog
          title="New Lock"
          okText={() => this.state.okText || 'Send'}
          close={close}
          onKeyEsc={this.onKeyEsc}
          confirm={() => {
            this.createLock(partner, promiseStm, date, file);
          }}
        >
          {!checked && (
            <div>
              <TagTitle>Tag your partner</TagTitle>
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
          <FormControlLabel
            control={<CustCheckbox checked={checked} onChange={this.handleCheckChange} value="checked" />}
            label="or create your own crush"
          />
          {checked && (
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
                  label="Crush First Name"
                  fullWidth
                  onChange={this.handleUsername}
                  name="firstname"
                  validators={['required']}
                  // margin="normal"
                />
                <TextFieldPlaceholder
                  label="Crush Last Name"
                  fullWidth
                  onChange={this.handleUsername}
                  name="lastname"
                  validators={['required']}
                  // margin="normal"
                />
                <TextFieldPlaceholder
                  label="Crush's Reply to You"
                  fullWidth
                  onChange={this.handleUsername}
                  name="botReply"
                  validators={['required']}
                />
              </RightBotInfo>
            </FlexBox>
          )}
          <DividerCus />
          <TagTitle className="prmContent">Your Message</TagTitle>
          <TextFieldMultiLine
            id="outlined-multiline-static"
            placeholder={checked ? 'Express yourself to your crush…' : 'Say something to your partner…'}
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
            isCreatePro
            hasParentDialog
            onDialogToggle={this.onDialogToggle}
          />
          <WarningPass>
            <SnackbarContent
              className="warningSnackbar"
              message={
                <span className="warningMessage">
                  <WarningIcon className="warningIcon" />
                  <span className="warningText">
                    This locks will be public. Private locks are not yet supported for this beta version.
                  </span>
                </span>
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
              <span>By create a lock with yourself, you will create a Journal instead.</span>
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
    tokenAddress: state.account.tokenAddress,
    tokenKey: state.account.tokenKey,
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withSnackbar(PuNewLock));
