import React, { useEffect, useState } from 'react';
import { IceteaId } from 'iceteaid-web';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount, setLoading, setStep } from '../../../store/actions';
import { getAlias, registerAlias, savetoLocalStorage, setTagsInfo, wallet } from '../../../helper';
import { getWeb3, grantAccessToken } from '../../../service/tweb3';
import { encode } from '../../../helper/encode';
import { useRemember } from '../../../helper/hooks';
import { encode as codecEncode } from '@iceteachain/common/src/codec';
import SyncAccountModal from '../../elements/SyncAccountModal';

const i = new IceteaId('xxx');

export default function LoggingAccount() {
  const [openModal, setOpenModal] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const [isRemember] = useRemember();
  const address = useSelector((state) => state.account.address);

  useEffect(() => {
    dispatch(setLoading(true));
    const checkHaveAcc = async () => {
      const key = await i.user.getKey();
      if (key) {
        let { privateKey, encryptionKey, mnemonic } = key;
        const decrypted = await i.user.decryptKey(privateKey, encryptionKey, mnemonic);
        let address;
        let publicKey;
        let mode = 0;

        if (wallet.isMnemonic(decrypted.mnemonic)) {
          const recoveryAccount = wallet.getAccountFromMneomnic(decrypted.mnemonic);
          ({ privateKey, address, publicKey } = recoveryAccount);
          mode = 1;
        } else {
          try {
            address = wallet.getAddressFromPrivateKey(decrypted.privateKey);
            publicKey = wallet.getPubKeyFromPrivateKey(decrypted.privateKey);
            privateKey = decrypted.privateKey;
          } catch (err) {
            err.showMessage = 'Invalid recovery phrase.';
            throw err;
          }
        }
        const username = await getAlias(address);
        if (!username) {
          dispatch(setLoading(false));
          dispatch(setStep('four'));
          return history.push('/');
        }

        // to make sure everyone update pubkey and address
        await i.user.exUpdatePbKeyAndAddress(publicKey, address);
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
          const keyObject = encode(mnemonic ? mnemonic : privateKey, privateKey);
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
        if (address) {
          return history.push('/syncAccount');
        }
        setOpenModal(true);
      }
    };
    checkHaveAcc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{openModal && <SyncAccountModal open={openModal} setOpen={setOpenModal} />}</>;
}
