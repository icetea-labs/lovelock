import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import styled from 'styled-components';
import { ValidatorForm } from 'react-material-ui-form-validator';
import TextField from '@material-ui/core/TextField';
import CommonDialog, { Action } from './CommonDialog';
import phoneImg from '../../assets/img/phone-ver.png';
import { axios, awsDecrypt, decrypt } from '../../helper';
import { ButtonPro, LinkPro } from './Button';


const ImageVerification = styled.img.attrs({
  src: phoneImg,
})`
    display:block;
    margin:auto;

`;

const Content = styled.div`
    text-align: center;
    margin-top: 20px;
`;

const PElement = styled.p`
  line-height: 25px;
`

export default function SendOtpModal(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSentOtp, setIsSentOtp] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const getInfo = async () => {
      const info = await axios.get('/users/info');
      setPhoneNumber(info.data.phone_number);
    };
    getInfo();
  }, []);

  function closeSendOtpModal() {
    props.setIsSendOtpActive(false);
  }

  async function sendOtp() {
    try {
      const response = await axios.post('/key/sendOtp', {
        phoneNumber,
      });
      if (response.data.verification) {
        setIsSentOtp(true);
        enqueueSnackbar('OTP has been sent to your mobile.', { variant: 'success' });
      }

    } catch (err) {
      enqueueSnackbar('Some error occurred.', { variant: 'error' });

    }
  }

  async function verify() {
    const response = await axios.post('/key/verifyOtp', {
      phoneNumber, verifyCode: otp
    });
    const decryptedEncryptionKey = await awsDecrypt(
      response.data
    )
    const decryptedPrivateKey = decrypt(response.data.privateKey, decryptedEncryptionKey)
    props.setRecoveryPhase(decryptedPrivateKey)
    props.setIsSendOtpActive(false);
  }

  return (
    <CommonDialog
      close={closeSendOtpModal}
      title="2 Step Verification"
    >
      <ImageVerification />
      {!isSentOtp &&
      <Content>
        <PElement>
          Enter your phone number to get verification code
        </PElement>
        <ValidatorForm onSubmit={closeSendOtpModal}>
          <TextField
            id="outlined-multiline-static"
            label="Your phone number"
            placeholder="Enter your phone number"
            multiline
            rows="1"
            onChange={event => {
              // Fix issue #148
              setPhoneNumber(event.currentTarget.value.toLowerCase());
            }}
            margin="normal"
            variant="outlined"
            fullWidth
            // helperText={rePassErr}
            // error={rePassErr !== ''}
            autoFocus
            value={phoneNumber}
          />

        </ValidatorForm>
      </Content>}
      {isSentOtp &&
      <Content>
        <PElement>A text message with a 6-digit verification code was just sent to {phoneNumber}</PElement>
        <ValidatorForm onSubmit={closeSendOtpModal}>
          <TextField
            id="outlined-multiline-static"
            label="Enter the code"
            placeholder="Enter your OTP code"
            multiline
            rows="1"
            onChange={event => {
              // Fix issue #148
              setOtp(event.currentTarget.value.toLowerCase());
            }}
            margin="normal"
            variant="outlined"
            fullWidth
            // helperText={rePassErr}
            // error={rePassErr !== ''}
            autoFocus
            value={otp}
          />
        </ValidatorForm>
      </Content>}

      <Action>
        <div className="actionConfirm">
          <LinkPro onClick={closeSendOtpModal} className="deny nextBtn">
            Close
          </LinkPro>
          {!isSentOtp &&
          <ButtonPro onClick={sendOtp} className="nextBtn send ">
            Send Otp
          </ButtonPro> }
          {isSentOtp &&
          <ButtonPro onClick={verify} className="nextBtn send ">
            Verify Otp
          </ButtonPro> }
        </div>
      </Action>
    </CommonDialog>
  );
}
