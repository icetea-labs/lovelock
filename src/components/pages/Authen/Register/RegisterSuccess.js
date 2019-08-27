import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import * as actionCreate from '../../../../store/actions/create';
import * as actionGlobal from '../../../../store/actions/globalData';
import encode from '../../../../helper/encode';
// import decode from '../../../../helper/decode';

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
  /* font-family: DIN; */
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

class RegisterSuccess extends React.Component {
  gotoHome = () => {
    const { privateKey, setLoading, setStep, history, password } = this.props;
    let keyObject = '';
    setLoading(true);
    setTimeout(async () => {
      keyObject = encode(privateKey, password);
      setLoading(false);
      localStorage.removeItem('user');
      // localStorage.setItem('user', JSON.stringify({ address, privateKey }));
      localStorage.setItem('user', JSON.stringify(keyObject));
      setStep('one');
      history.push('/');
    }, 500);
  };

  render() {
    const { mnemonic } = this.props;
    return (
      <div>
        <WrapperImg>
          <img src="/static/img/success.svg" alt="" />
          <Title>Wow, you have registered successfuly!</Title>
          <Desc>
            <span>Here is your account's</span>
            <MnemonixText>
              <p data-cy="mnemonic">{mnemonic}</p>
            </MnemonixText>
            <span>In case you forget your password, use this recovery phase to gain access to your account.</span>
          </Desc>
          <FoolterBtn>
            <Button variant="contained" color="primary" onClick={this.gotoHome}>
              I've saved the recovery phase
            </Button>
          </FoolterBtn>
        </WrapperImg>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    keyStore: state.create.keyStore,
    mnemonic: state.account.mnemonic,
    address: state.account.address,
    privateKey: state.account.privateKey,
    password: state.account.cipher,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: step => {
      dispatch(actionCreate.setStep(step));
    },
    setLoading: value => {
      dispatch(actionGlobal.setLoading(value));
    },
  };
};

RegisterSuccess.defaultProps = {
  setStep() {},
  history: {},
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(RegisterSuccess));
