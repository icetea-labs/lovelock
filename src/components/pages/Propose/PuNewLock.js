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
import * as actions from '../../../store/actions';
import tweb3 from '../../../service/tweb3';
import { saveFileToIpfs, saveBufferToIpfs, sendTransaction, tryStringifyJson, getTagsInfo } from '../../../helper';
import AddInfoMessage from '../../elements/AddInfoMessage';
import CommonDialog from '../../elements/CommonDialog';
import { FlexBox } from '../../elements/StyledUtils';
import ImageCrop from '../../elements/ImageCrop';
import { AvatarPro } from '../../elements';

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
    clearTimeout(this.timeoutHanle1);
    clearTimeout(this.timeoutHanle2);
  }

  onChangeDate = date => {
    this.setState({ date });
  };

  onChangeMedia = file => {
    this.setState({ file });
  };

  async getSuggestions(value) {
    let escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue.length <= 3) {
      this.setState({ suggestions: [] });
      return;
    }

    let people = [];
    escapedValue = escapedValue.substring(escapedValue.indexOf('@') + 1);
    const regex = new RegExp(`\\b${escapedValue}`, 'i');

    const peopleAva = [];

    try {
      const method = 'callReadonlyContractMethod';
      const add = 'system.alias';
      const func = 'query';

      const result = await tweb3[method](add, func, [escapedValue]);
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
      peopleAva.push(resp.avatar);
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
      partner: val,
    });
    // console.log("view partnerChange", val);
  };

  promiseStmChange = e => {
    const val = e.target.value;
    this.setState({
      promiseStm: val,
    });
    // console.log("view promiseStmChange", value);
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

    this.setState({ [key]: val });
  };

  handleImageChange = event => {
    event.preventDefault();
    const orFiles = event.target.files;
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
    const { proposes, enqueueSnackbar } = this.props;
    let message = '';
    for (let i = 0; i < proposes.length; i++) {
      if (proposes[i].sender === proposes[i].receiver) {
        message = 'You already had a journal and cannot create one more.';
        enqueueSnackbar(message, { variant: 'error' });
      }
    }

    if (message) {
      this.closeJournal();
    } else {
      this.setState({ isJournal: false });
    }
  };

  async createPropose(partner, promiseStm, date, file) {
    const { setLoading, enqueueSnackbar, close, address, tokenAddress } = this.props;
    const { firstname, lastname, cropFile, checked, botReply } = this.state;
    let botAva = '';
    let hash = [];
    let message = '';

    setLoading(true);

    this.timeoutHanle1 = setTimeout(async () => {
      try {
        if (cropFile) {
          botAva = await saveFileToIpfs(cropFile);
        }
        if (!partner) {
          message = 'Please choose your partner.';
          enqueueSnackbar(message, { variant: 'error' });
          setLoading(false);
          return;
        }
        if (!promiseStm) {
          message = 'Please input your lock.';
          enqueueSnackbar(message, { variant: 'error' });
          setLoading(false);
          return;
        }

        let botInfo;
        if (checked) {
          if (!firstname) {
            message = 'Please enter your crush first name.';
            enqueueSnackbar(message, { variant: 'error' });
            setLoading(false);
            return;
          }
          if (!lastname) {
            message = 'Please enter your crush last name.';
            enqueueSnackbar(message, { variant: 'error' });
            setLoading(false);
            return;
          }
          if (!cropFile) {
            message = 'Please choose avatar of your crush.';
            enqueueSnackbar(message, { variant: 'error' });
            setLoading(false);
            return;
          }
          if (!botReply) {
            message = 'Please enter the reply from your crush.';
            enqueueSnackbar(message, { variant: 'error' });
            setLoading(false);
            return;
          }
          botInfo = { firstname, lastname, botAva, botReply };
        }

        if (file) {
          hash = await saveBufferToIpfs(file);
        }

        const info = { date, hash };
        const name = 'createPropose';

        const params = [promiseStm, partner, info, botInfo];
        // const params = [promiseStm, partner, info];
        const result = await sendTransaction(name, params, { address, tokenAddress });

        this.timeoutHanle2 = setTimeout(() => {
          if (result) {
            message = 'Your lock sent successfully.';
            enqueueSnackbar(message, { variant: 'success' });
            setLoading(false);
            close();
          }
        }, 50);
      } catch (err) {
        console.error(err);
        message = 'an error occurred while sending, please check the inner exception for details';
        enqueueSnackbar(message, { variant: 'error' });
        setLoading(false);
      }
    }, 100);
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
    // console.log('state CK', this.state);

    const inputProps = {
      placeholder: '@partner',
      value,
      onChange: this.onPartnerChange,
    };

    return (
      <CommonDialog
        title="New Lock"
        okText={() => this.state.okText || 'Send'}
        close={close}
        confirm={() => {
          this.createPropose(partner, promiseStm, date, file);
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
                    onChange={this.handleImageChange}
                    accept="image/jpeg,image/png"
                  />
                  <CameraAltIcon />
                </div>
              </div>
            </PreviewContainter>
            <RightBotInfo>
              <TextFieldPlaceholder
                label="First Name"
                fullWidth
                onChange={this.handleUsername}
                name="firstname"
                validators={['required']}
                // margin="normal"
              />
              <TextFieldPlaceholder
                label="Last Name"
                fullWidth
                onChange={this.handleUsername}
                name="lastname"
                validators={['required']}
                // margin="normal"
              />
              <TextFieldPlaceholder
                label="Crush's response to your lock"
                fullWidth
                onChange={this.handleUsername}
                name="botReply"
                validators={['required']}
              />
            </RightBotInfo>
          </FlexBox>
        )}
        <DividerCus />
        <TagTitle className="prmContent">Lock content</TagTitle>
        <TextFieldMultiLine
          id="outlined-multiline-static"
          placeholder="lock content ..."
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
        />
        {isOpenCrop && <ImageCrop close={this.closeCrop} accept={this.acceptCrop} originFile={originFile} />}
        {isJournal && (
          <CommonDialog
            title="Journal"
            okText="Yes, let's create"
            cancelText="Cancel"
            close={this.closeJournal}
            cancel={this.closeJournal}
            confirm={this.createJournal}
            isCancel
          >
            <TagTitle>
              <span>By create a lock with yourself, you will create a Journal instead.</span>
            </TagTitle>
          </CommonDialog>
        )}
      </CommonDialog>
    );
  }
}

Promise.defaultProps = {
  send() {},
  close() {},
};

const mapStateToProps = state => {
  return {
    proposes: state.loveinfo.proposes,
    address: state.account.address,
    tokenAddress: state.account.tokenAddress,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setLoading: value => {
      dispatch(actions.setLoading(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withSnackbar(PuNewLock));
