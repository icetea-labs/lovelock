import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { codec } from '@iceteachain/common';

import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import * as actionGlobal from '../../../../store/actions/globalData';
import { encode } from '../../../../helper/encode';
import { savetoLocalStorage } from '../../../../helper';
import tweb3 from '../../../../service/tweb3';

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
      margin-bottom: 3px;
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
    privateKey,
    setLoading,
    setStep,
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
      const token = tweb3.wallet.createRegularAccount();
      const ms = tweb3.contract('system.did').methods;
      const expire = isRemember ? process.env.REACT_APP_TIME_EXPIRE : process.env.REACT_APP_DEFAULT_TIME_EXPIRE;

      ms.grantAccessToken(address, [process.env.REACT_APP_CONTRACT, 'system.did'], token.address, parseInt(expire, 10))
        .sendCommit({ from: address })
        .then(async ({ returnValue }) => {
          tweb3.wallet.importAccount(token.privateKey);
          const keyObject = encode(mnemonic, password);
          const storage = isRemember ? localStorage : sessionStorage;
          // save token account
          storage.sessionData = codec
            .encode({
              contract: process.env.REACT_APP_CONTRACT,
              tokenAddress: token.address,
              tokenKey: token.privateKey,
              expireAfter: returnValue,
            })
            .toString('base64');
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
        <Title>Wow, you created an account!</Title>
        <Desc>
          <span>Save your recovery phrase bellow:</span>
          <MnemonixText>
            <p data-cy="mnemonic">{mnemonic}</p>
          </MnemonixText>
          <div className="note">
            <span>
              <h5>NOTE</h5> In case you forget your password, this recovery phrase is <u>the only way</u> to gain access
              to your account. Keep it secret.
            </span>
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
              label="I've saved my recovery phrase"
            />
          </div>
          <Button disabled={!savedPhrase} variant="contained" size="large" color="primary" onClick={gotoHome}>
            Continue
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(RegisterSuccess));
