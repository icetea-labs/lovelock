import React from 'react';
import styled from 'styled-components';
import QueueAnim from 'rc-queue-anim';

import { ButtonPro, LinkPro } from '../../elements/Button';
import { ValidatorForm } from 'react-material-ui-form-validator';
import IconButton from '@material-ui/core/IconButton';

const PuLayout = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
`;

const Container = styled.div`
  width: 600px;
  /* min-height: 390px; */
  max-height: 730px;
  border-radius: 10px;
  box-shadow: 0 14px 52px 0 rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  /* padding: 10px; */
  box-sizing: border-box;
  background: ${props => props.theme.popupBg};
  box-shadow: ${props => props.theme.boxShadow};
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  @media (max-width: 768px) {
    width: 100%;
    min-width: 300px;
    max-width: 300px;
    padding: 15px;
    top: 20%;
  }
`;

const PuTitle = styled.div`
  display: flex;
  /* width: 600px; */
  height: 62px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: #8250c8;
  font-family: Montserrat;
  font-size: 18px;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #ffffff;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  .title {
    margin-left: 8px;
  }
  .material-icons {
    cursor: pointer;
    color: white;
  }
`;

const ContWrap = styled.div`
  width: 90%;
  height: 90%;
  padding: 30px;
`;

const Action = styled.div`
  .actionConfirm {
    width: 100%;
    margin: 40px 0 16px;
    justify-content: center;
    display: flex;
    button {
      width: 172px;
      line-height: 34px;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      border-radius: 23px;
    }
    .send {
      background-image: linear-gradient(340deg, #b276ff, #fe8dc3);
    }
    .deny {
      margin-right: 34px;
      background: #ffffff;
      border: 1px solid #5e5e5e;
      display: flex;
      justify-content: center;
      font-weight: 600;
      color: #373737;
    }
  }
`;

class CommonDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      smt: '',
    };
  }
  render() {
    const { cancel, confirm, close, okText, cancelText, children, title, isCancel } = this.props;
    return (
      <QueueAnim animConfig={{ opacity: [1, 0] }}>
        <PuLayout key={1}>
          <QueueAnim leaveReverse delay={100} type={['top', 'bottom']}>
            <Container key={2}>
              <PuTitle>
                <span className="title">{title}</span>
                <IconButton onClick={close}>
                  <i className="material-icons">close</i>
                </IconButton>
              </PuTitle>
              <ContWrap>
                {children}
                <Action>
                  <div className="actionConfirm">
                    {isCancel && (
                      <ValidatorForm onSubmit={cancel}>
                        <LinkPro className="deny" type="submit">
                          {cancelText}
                        </LinkPro>
                      </ValidatorForm>
                    )}
                    <ValidatorForm onSubmit={confirm}>
                      <ButtonPro className="send" type="submit">
                        {okText}
                      </ButtonPro>
                    </ValidatorForm>
                  </div>
                </Action>
              </ContWrap>
            </Container>
          </QueueAnim>
        </PuLayout>
      </QueueAnim>
    );
  }
}

CommonDialog.defaultProps = {
  isCancel: false,
  close() {},
  cancel() {},
  confirm() {},
  okText: '',
  cancelText: '',
  title: '',
  children: null,
};

export default CommonDialog;
