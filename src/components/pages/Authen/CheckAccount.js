import React, { useEffect } from 'react';
import { IceteaId } from 'iceteaid-web';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAccount, setLoading, setStep } from '../../../store/actions';
import { savetoLocalStorage, wallet } from '../../../helper';
import { getWeb3, grantAccessToken } from '../../../service/tweb3';
import { encode } from '../../../helper/encode';
import { useRemember } from '../../../helper/hooks';
import { encode as codecEncode } from '@iceteachain/common/src/codec';

const i = new IceteaId('xxx');

export default function CheckAccount() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [isRemember] = useRemember();

  useEffect(() => {
    dispatch(setLoading(true));
    const checkHaveAcc = async () => {
      const key = await i.user.getKey();
      if (key.payload) {
        const { private_key, encryption_key, mnemonic } = key.payload;
        const decrypted = await i.user.decryptKey(private_key, encryption_key, mnemonic);
        let privateKey = decrypted.payload.privateKey;
        let address;
        let mode = 0;

        if (wallet.isMnemonic(decrypted.payload.mnemonic)) {
          const recoveryAccount = wallet.getAccountFromMneomnic(decrypted.payload.mnemonic);
          ({ privateKey, address } = recoveryAccount);
          mode = 1;
        } else {
          try {
            address = wallet.getAddressFromPrivateKey(decrypted.payload.privateKey);
          } catch (err) {
            err.showMessage = 'Invalid recovery phrase.';
            throw err;
          }
        }
        const tweb3 = getWeb3();
        const acc = tweb3.wallet.importAccount(privateKey);
        // tweb3.wallet.defaultAccount = address;

        // check if account is a regular address
        if (!tweb3.utils.isRegularAccount(acc.address)) {
          const m = 'The recovery phrase is for a bank account. LoveLock only accepts regular (non-bank) account.';
          const error = new Error(m);
          error.showMessage = m;
          throw error;
        }

        const token = tweb3.wallet.createRegularAccount();
        grantAccessToken(address, token.address, isRemember).then(({ returnValue }) => {
          tweb3.wallet.importAccount(token.privateKey);
          const keyObject = encode(privateKey, '');
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
            address,
            privateKey,
            tokenAddress: token.address,
            tokenKey: token.privateKey,
            encryptedData: keyObject,
            mode,
            mnemonic: mode === 1 ? privateKey : '',
          };
          dispatch(setAccount(account));
          dispatch(setLoading(false));
          dispatch(setStep('one'));
          history.push('/');
        });
      } else {
        dispatch(setLoading(false));
        dispatch(setStep('four'));
        history.push('/');
      }
    };
    checkHaveAcc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
