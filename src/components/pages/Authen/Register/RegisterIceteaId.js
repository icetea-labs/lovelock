import React, { useEffect } from 'react';
import QueueAnim from 'rc-queue-anim';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import styled from 'styled-components';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import * as actionCreate from '../../../../store/actions/create';
import { ButtonPro, ButtonGoogle } from '../../../elements/Button';

const DivActionButton = styled.div`
  margin: 15px 0 15px 0
`;

const OrParagraph = styled.div`
  margin-bottom: 16px;
  margin-top: 16px;
  overflow: hidden;
  text-align: center;
  font-size: 14px;
  color: rgb(51, 51, 51);
  font-weight: bold;
`;

export default function RegisterIceteaId({ redirectUrl }) {
  const dispatch = useDispatch();
  const step = useSelector(state => state.create.step);
  useEffect(() => {
    dispatch(actionCreate.setStep(step));
  }, [dispatch, step]);

  return (
    <>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthen>
            <ShadowBoxAuthen>
              <>
                {step === 'one' && <HeaderAuthen title={<FormattedMessage id="regist.registIceteaId" />} />}
                <ValidatorForm>
                  <TextValidator
                    label={<FormattedMessage id="regist.userName" />}
                    fullWidth
                    name="username"
                    validators={['required', 'specialCharacter', 'isAliasRegistered']}
                    errorMessages={[
                      <FormattedMessage id="regist.requiredMes" />,
                      <FormattedMessage id="regist.characterCheck" />,
                      <FormattedMessage id="regist.userTaken" />,
                    ]}
                    margin="dense"
                    inputProps={{ autoComplete: 'username' }}
                  />
                  <TextValidator
                    label={<FormattedMessage id="regist.password" />}
                    fullWidth
                    name="username"
                    validators={['required', 'specialCharacter', 'isAliasRegistered']}
                    errorMessages={[
                      <FormattedMessage id="regist.requiredMes" />,
                      <FormattedMessage id="regist.characterCheck" />,
                      <FormattedMessage id="regist.userTaken" />,
                    ]}
                    margin="dense"
                    inputProps={{ autoComplete: 'password' }}
                  />
                </ValidatorForm>
                <DivActionButton>
                  <ButtonPro fullWidth className="alreadyAcc">
                    <FormattedMessage id="regist.login" />
                  </ButtonPro>
                </DivActionButton>
                <OrParagraph>
                  Or
                </OrParagraph>
                <DivActionButton>
                  <ButtonGoogle
                    className="alreadyAcc"
                    fullWidth
                    onClick={() => window.location = `http://localhost:3001/login/google?return_uri=${redirectUrl}`}
                  >
                    Continue with Google
                  </ButtonGoogle>
                </DivActionButton>
              </>
            </ShadowBoxAuthen>
          </BoxAuthen>
        </LayoutAuthen>
      </QueueAnim>
    </>
  );
}
