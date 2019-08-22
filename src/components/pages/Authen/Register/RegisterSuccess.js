import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
// import * as actions from '../../../store/actions/create';
// import { Button } from '../../elements';
// import { Icon } from '../../elements/utils';
// import success from '../../../assets/img/success.svg';
import * as actionCreate from '../../../../store/actions/create';
import Button from '@material-ui/core/Button';
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
  font-family: DIN;
  text-align: center;
  span {
    color: #f23051;
  }
`;
const Desc = styled.ul`
  padding: 0 30px;
  font-size: 14px;
  margin-top: 15px;
  li {
    text-align: center;
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
    const { props } = this;
    props.setStep('one');
    props.history.push('/');
  };

  render() {
    return (
      <div>
        <WrapperImg>
          <img src="/static/img/success.svg" alt="" />
          <Title>You&rsquo;re create account success!</Title>
          <Desc>
            <li>You are ready to use the LoveLock</li>
          </Desc>
          {/* <Desc>
            <li>Ice-Tea Chain!</li>
          </Desc> */}
          <FoolterBtn>
            {/* <Button width="170px" onClick={this._gotoUnlock}>
              <React.Fragment>
                <span style={{ marginRight: '10px' }}>Unlock the wallet</span>
                <Icon type="continue" size="20" color="inherit" />
              </React.Fragment>
            </Button> */}
            <Button color="primary" onClick={this.gotoHome}>
              Go Home
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
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setStep: step => {
      dispatch(actionCreate.setStep(step));
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
