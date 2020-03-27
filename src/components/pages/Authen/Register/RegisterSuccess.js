import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { encode as codecEncode } from '@iceteachain/common/src/codec';
import { FormattedMessage } from 'react-intl';

import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import * as actionGlobal from '../../../../store/actions/globalData';
import { encode } from '../../../../helper/encode';
import { savetoLocalStorage } from '../../../../helper';
import { getWeb3, grantAccessToken } from '../../../../service/tweb3';

const WrapperImg = styled.div`
  margin-top: 20px;
  img {
    width: 50px;
    margin: 0 auto;
    display: block;
    margin-bottom: 15px;
  }
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  span {
    color: #f23051;
  }
`;
const Desc = styled.ul`
  padding: 0 30px;
  font-size: 14px;
  margin-top: 25px;
  li {
    text-align: center;
  }
  span {
    line-height: 18px;
  }
  h1 {
    font-weight: bold;
    margin: 10px;
  }
  .note {
    display: flex;
    padding: 12px 6px 12px 20px;
    background-color: #fe7;
    line-height: 1.4;
    h5 {
      font-weight: 700;
      margin-bottom: 1rem;
    }
    ul li {
      text-align: left;
    }
    p {
      padding-top: 1rem;
    }
  }
`;
const MnemonixText = styled.div`
  text-align: center;
  position: relative;
  background: rgb(249, 249, 249);
  border-width: 1px;
  border-style: dashed;
  border-color: rgb(216, 216, 216);
  padding: 15px;
  margin: 15px 0;
  p {
    line-height: 25px;
    font-size: 18px;
    word-spacing: 6px;
    font-weight: 900;
  }
`;
const FoolterBtn = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

function RegisterSuccess(props) {
  const {
    address,
    // privateKey,
    setLoading,
    // setStep,
    history,
    password,
    mnemonic,
    setAccount,
    isRemember,
    pathName,
    setPathName,
  } = props;

  const [savedPhrase, setSavedPhrase] = useState(false);

  function gotoHome() {
    setLoading(true);
    setTimeout(async () => {
      const mode = 1;
      const tweb3 = getWeb3();

      const token = tweb3.wallet.createRegularAccount();
      grantAccessToken(address, token.address, isRemember).then(async ({ returnValue }) => {
        tweb3.wallet.importAccount(token.privateKey);
        const keyObject = encode(mnemonic, password);
        const storage = isRemember ? localStorage : sessionStorage;
        // save token account
        storage.sessionData = codecEncode({
          contract: process.env.REACT_APP_CONTRACT,
          tokenAddress: token.address,
          tokenKey: token.privateKey,
          expireAfter: returnValue,
        }).toString('base64');
        // save main account
        savetoLocalStorage({ address, mode, keyObject });
        const account = {
          tokenAddress: token.address,
          tokenKey: token.privateKey,
          encryptedData: keyObject,
          mode,
        };
        setAccount(account);
        // setStep('one');
        setLoading(false);
        if (pathName) {
          history.push(pathName);
        } else history.push('/');
      });
    }, 100);
    setPathName('');
  }

  return (
    <div>
      <WrapperImg>
        <img src="/static/img/success.svg" alt="" />
        <Title>
          <FormattedMessage id="regist.successTitle" />
        </Title>
        <Desc>
          <span>
            <FormattedMessage id="regist.successDecs" />
          </span>
          <MnemonixText>
            <p data-cy="mnemonic">{mnemonic}</p>
          </MnemonixText>
          <div className="note">
            <div>
              <h5>
                <FormattedMessage id="regist.successNote" />
              </h5>
              <ul>
                <li>
                  <FormattedMessage id="regist.successNote1" />
                </li>
                <li>
                  <FormattedMessage id="regist.successNote2" />
                </li>
              </ul>
              <p>
                <FormattedMessage id="regist.successWarning" />
              </p>
            </div>
          </div>
        </Desc>

        <FoolterBtn>
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  color="primary"
                  value={savedPhrase}
                  checked={savedPhrase}
                  onChange={() => setSavedPhrase(!savedPhrase)}
                />
              }
              label={<FormattedMessage id="regist.successConfirm" />}
            />
          </div>
          <Button disabled={!savedPhrase} variant="contained" size="large" color="primary" onClick={gotoHome}>
            <FormattedMessage id="regist.btnContinue" />
          </Button>
        </FoolterBtn>
      </WrapperImg>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    mnemonic: state.account.mnemonic,
    address: state.account.address,
    privateKey: state.account.privateKey,
    password: state.account.cipher,
    isRemember: state.create.isRemember,
    pathName: state.create.pathName,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: step => {
      dispatch(actionCreate.setStep(step));
    },
    setAccount: value => {
      dispatch(actionAccount.setAccount(value));
    },
    setLoading: value => {
      dispatch(actionGlobal.setLoading(value));
    },
    setPathName: value => {
      dispatch(actionCreate.setPathName(value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RegisterSuccess));
