import React, {useEffect} from 'react';
import { IceteaId } from 'iceteaid-web';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setStep } from '../../../store/actions';

const i = new IceteaId('xxx');

export default function IconLabelTabs() {
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkHaveAcc = async () => {
      const key = await i.user.getKey();
      if (key.payload) {
        dispatch(setStep('two'));
        return history.push('/login')
      }
      const needSync = localStorage.getItem('needSync');
      if (needSync) return history.push('/syncAccount');
      return history.push('/updateInfo');
    }
    checkHaveAcc()
  }, [])

  return (
    <>
    </>
  );
}
