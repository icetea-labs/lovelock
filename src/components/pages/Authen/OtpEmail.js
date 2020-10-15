import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import { FormattedMessage } from 'react-intl';
import { DivControlBtnKeystore } from '../../elements/StyledUtils';
import { ButtonPro } from '../../elements/Button';
import * as actionCreate from '../../../store/actions/create';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { IceteaId } from 'iceteaid-web';
import { useHistory } from 'react-router-dom';

const i = new IceteaId('xxx');

export default function OtpEmail({isSentOtp, setIsSent}) {
  const [email, setEmail]= useState('');
  const [otp, setOtp] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const dispatch = useDispatch();

  const sendOtp = async () => {
    try {
      const sendOtp = await i.auth.sendOtp(email, 'email')
      setIsSent(true)
      enqueueSnackbar(sendOtp.payload.message, { variant: 'success' });
    } catch (err) {
      const msg = err.payload.message || err.message
      enqueueSnackbar(msg, { variant: 'error' });
    }
  }

  const verifyOtp = async () => {
    try {
      const verify = await i.auth.verifyOtp(email, 'email', otp)
      return history.push('/checkAccount')
    } catch (err) {
      const msg = err.payload.message || err.message
      enqueueSnackbar(msg, { variant: 'error' });
    }
  }

  return (
    <>
      <ValidatorForm onSubmit={() => !isSentOtp ? sendOtp() : verifyOtp()}>
        <TextValidator
          label={<FormattedMessage id="regist.email" />}
          fullWidth
          onChange={event => {
            // Fix issue #148
            setEmail(event.currentTarget.value.toLowerCase());
          }}
          name="email"
          validators={['required']}
          errorMessages={[
            <FormattedMessage id="regist.requiredMes" />,
          ]}
          margin="dense"
          value={email}
          inputProps={{ autoComplete: 'email' }}
        />
        {isSentOtp && <TextValidator
          label={<FormattedMessage id="regist.otpCode" />}
          fullWidth
          onChange={event => {
            // Fix issue #148
            setOtp(event.currentTarget.value.toLowerCase());
          }}
          name="otp"
          validators={['required']}
          errorMessages={[
            <FormattedMessage id="regist.requiredMes" />,
          ]}
          margin="dense"
          value={otp}
          inputProps={{ autoComplete: 'otpCode' }}
        />}
        <DivControlBtnKeystore>
          <ButtonPro color="primary" className="backBtn" onClick={() => dispatch(actionCreate.setStep('one'))}>
            <FormattedMessage id="login.btnBack" />
          </ButtonPro>
          {!isSentOtp && <ButtonPro variant="contained" color="primary" className="nextBtn" type="submit">
            <FormattedMessage id="login.sendOtp" />
          </ButtonPro>}
          {isSentOtp && <ButtonPro variant="contained" color="primary" className="nextBtn" type="submit">
            <FormattedMessage id="next" />
          </ButtonPro>}
        </DivControlBtnKeystore>
      </ValidatorForm>
    </>
  )
}
