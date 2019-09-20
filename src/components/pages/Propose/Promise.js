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
import { tryStringifyJson } from '../../../helper/utils';
import * as actions from '../../../store/actions';
import tweb3 from '../../../service/tweb3';
import { saveToIpfs, sendTransaction, setTagsInfo } from '../../../helper';
import AddInfoMessage from '../../elements/AddInfoMessage';
import CommonDialog from './CommonDialog';
import { FlexBox } from '../../elements/StyledUtils';

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
  padding: 20px 0 0 0;
  font-size: 14px;
  cursor: pointer;
  .upload_img input[type='file'] {
      font-size: 100px;
      position: absolute;
      left: 10;
      top: 0;
      opacity: 0;
      cursor: pointer;
    }
    .upload_img {
      position: relative;
      overflow: hidden;
      display: inline-block;
      cursor: pointer;
    }
  .fileInput {
    width: 50px;
    height: 50px;
    border: 1px solid #eddada8f;
    padding: 2px;
    margin: 10px;
    cursor: pointer;
  }
  .imgPreview {
    text-align: center;
    margin-right: 15px;
    height: 70px;
    width: 70px;
    border: 1px solid #eddada8f;
    border-radius: 50%;
    cursor: pointer;
    img {
      width: 100%
      height: 100%
      cursor: pointer;
      border-radius: 50%;
    }
  }
  .previewAvaDefault {
    cursor: pointer;
    color: #736e6e
  }
`;
class Promise extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      partner: '',
      promiseStm: '',
      date: new Date(),
      file: '',
      value: '',
      suggestions: [],
      checked: false,
      imgPreviewUrl: '',
      botAvaFile: '',
    };
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutHanle1);
    clearTimeout(this.timeoutHanle2);
  }

  partnerChange = e => {
    const value = e.target.value;
    this.setState({
      partner: value,
    });
    // console.log("view partnerChange", value);
  };

  promiseStmChange = e => {
    const val = e.target.value;
    this.setState({
      promiseStm: val,
    });
    // console.log("view promiseStmChange", value);
  };

  onChangeDate = date => {
    this.setState({ date });
  };

  onChangeMedia = file => {
    this.setState({ file });
  };

  async createPropose(partner, promiseStm, date, file) {
    const { setLoading, enqueueSnackbar, address, close } = this.props;
    const { firstname, lastname, botAvaFile, checked, botReply } = this.state;
    let botAva;
    let hash;
    let message;
    setLoading(true);

    this.timeoutHanle1 = setTimeout(async () => {
      try {
        if (file) {
          hash = await saveToIpfs(file);
        }
        if (botAvaFile) {
          botAva = await saveToIpfs(botAvaFile);
        }
        let info = {
          date,
          hash,
        };
        info = JSON.stringify(info);
        const name = 'createPropose';
        if (!partner) {
          message = 'Please choose your partner.';
          enqueueSnackbar(message, { variant: 'error' });
          setLoading(false);
          return;
        }
        if (!promiseStm) {
          message = 'Please input your promise.';
          enqueueSnackbar(message, { variant: 'error' });
          setLoading(false);
          return;
        }

        let botInfo = {};
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
          if (!botAvaFile) {
            message = 'Please enter avatar of your crush.';
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
          // const respTagFirstName = await setTagsInfo(address, 'bot-firstName', firstname);
          // const respTagLastName = await setTagsInfo(address, 'bot-lastName', lastname);
          botInfo = {
            firstname,
            lastname,
            botAva,
            botReply,
          };
        }

        botInfo = JSON.stringify(botInfo);

        const params = [promiseStm, partner, info, botInfo];
        // const params = [promiseStm, partner, info];
        const result = await sendTransaction(name, params);

        this.timeoutHanle2 = setTimeout(() => {
          if (result) {
            message = 'Your propose sent successfully.';
            enqueueSnackbar(message, { variant: 'success' });
            setLoading(false);
            close();
          }
        }, 50);
      } catch (err) {
        // console.log(err);
        setLoading(false);
      }
    }, 100);
  }

  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async getSuggestions(value) {
    let escapedValue = this.escapeRegexCharacters(value.trim());
    const address = this.props.address;

    if (escapedValue === '@' || escapedValue === '') {
      this.setState({
        suggestions: [],
      });
    }

    let people = [];
    escapedValue = escapedValue.substring(escapedValue.indexOf('@') + 1);
    // console.log('escapedValue', escapedValue);

    const regex = new RegExp('\\b' + escapedValue, 'i');
    try {
      const method = 'callReadonlyContractMethod';
      const add = 'system.alias';
      const func = 'query';
      if (escapedValue.length > 2) {
        const result = await tweb3[method](add, func, [escapedValue]);
        people = Object.keys(result).map(function(key, index) {
          const nick = key.substring(key.indexOf('.') + 1);
          return { nick: nick, address: result[key].address };
        });
      }
    } catch (err) {
      console.log(tryStringifyJson(err));
    }

    people = people.filter(person => person.address !== address);
    people = people.filter(person => regex.test(this.getSuggestionValue(person)));
    people = people.slice(0, 10);

    this.setState({
      suggestions: people,
    });
  }

  getSuggestionValue(suggestion) {
    return `@${suggestion.nick}`;
  }

  renderSuggestion(suggestion, { query }) {
    const suggestionText = `${suggestion.nick}`;
    const matches = AutosuggestHighlightMatch(suggestionText, query);
    const parts = AutosuggestHighlightParse(suggestionText, matches);

    return (
      <span className="suggestion-content">
        <span>
          <img src="/static/img/user-men.jpg" alt="itea" />
        </span>
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
  }

  onPartnerChange = (event, { newValue }) => {
    const name = newValue.substring(1);
    // console.log('newValue', newValue);
    if (newValue !== '@bot-lover') {
      this.setState({ checked: false });
    } else {
      this.setState({ checked: true });
    }
    const { suggestions } = this.state;
    let address = '';
    if (suggestions) {
      const seletedItem = suggestions.filter(item => item.nick === name);
      if (seletedItem && seletedItem.length > 0) {
        address = seletedItem[0].address;
      }
      // console.log('add', address);
    }
    this.setState({
      value: newValue,
      partner: address,
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.getSuggestions(value);
    // this.setState({
    //   suggestions: this.getSuggestions(value),
    // });
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
        partner: process.env.REACT_APP_BOT_LOVER,
      });
      // document.addEventListener('DOMContentLoaded', function(event) {
      //   document.getElementById('suggestPartner').disabled = true;
      // });
    } else {
      this.setState({
        checked: false,
        value: '',
      });
      // document.addEventListener('DOMContentLoaded', function(event) {
      //   document.getElementById('suggestPartner').disabled = false;
      // });
    }
  };

  handleUsername = event => {
    const key = event.currentTarget.name;
    const val = event.currentTarget.value;
    // console.log(event.currentTarget.value);

    this.setState({ [key]: val });
  };

  handleImageChange = e => {
    e.preventDefault();

    const reader = new FileReader();
    const { files } = e.target;
    const file = files[0];

    reader.onloadend = () => {
      if (files) {
        this.setState({
          botAvaFile: files,
          imgPreviewUrl: reader.result,
        });
      }
    };

    if (file && file.type.match('image.*')) {
      reader.readAsDataURL(file);
    }
  };

  render() {
    const { close } = this.props;
    const { partner, promiseStm, date, file, suggestions, value, checked, imgPreviewUrl } = this.state;
    // console.log('state CK', this.state);

    const inputProps = {
      placeholder: '@partner',
      value,
      onChange: this.onPartnerChange,
    };

    let $imagePreview = null;
    if (imgPreviewUrl) {
      $imagePreview = <img src={imgPreviewUrl} alt="imgPreview" />;
    } else {
      $imagePreview = <img src="/static/img/no-avatar.jpg" alt="avaDefault" className="previewAvaDefault" />;
    }

    return (
      <CommonDialog
        title="Promise"
        okText="Send"
        close={close}
        confirm={() => {
          this.createPropose(partner, promiseStm, date, file);
        }}
      >
        <TagTitle>Tag your partner you promise</TagTitle>
        {/* <TextFieldPlaceholder
          id="outlined-helperText"
          placeholder="@partner"
          margin="normal"
          variant="outlined"
          fullWidth
          onChange={this.partnerChange}
        /> */}
        <Autosuggest
          id="suggestPartner"
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
        />
        <FormControlLabel
          control={<CustCheckbox checked={checked} onChange={this.handleCheckChange} value="checked" />}
          label="or create a secret crush"
        />
        {checked && (
          <FlexBox>
            <PreviewContainter>
              <div className="upload_img">
                <input className="fileInput" type="file" onChange={this.handleImageChange} accept="image/*" />
                <div className="imgPreview">{$imagePreview}</div>
              </div>
            </PreviewContainter>
            <div>
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
                label="Crush's response to your promise"
                fullWidth
                onChange={this.handleUsername}
                name="botReply"
                validators={['required']}
              />
            </div>
          </FlexBox>
        )}
        <DividerCus />
        <TagTitle className="prmContent">Promise content</TagTitle>
        <TextFieldMultiLine
          id="outlined-multiline-static"
          placeholder="promise content ..."
          multiline
          fullWidth
          rows="4"
          variant="outlined"
          onChange={this.promiseStmChange}
        />
        <AddInfoMessage files={file} date={date} onChangeDate={this.onChangeDate} onChangeMedia={this.onChangeMedia} />
      </CommonDialog>
    );
  }
}

Promise.defaultProps = {
  send() {},
  close() {},
};

const mapStateToProps = state => {
  const { loveinfo, account } = state;
  return {
    propose: loveinfo.propose,
    currentIndex: loveinfo.currentProIndex,
    memory: loveinfo.memory,
    address: account.address,
    privateKey: account.privateKey,
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
)(withSnackbar(Promise));
