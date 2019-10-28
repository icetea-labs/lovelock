import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import CommonDialog from '../elements/CommonDialog';

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

export default function ShowMnemonic(props) {
  const mnemonic = useSelector(state => state.account.mnemonic);
  const privateKey = useSelector(state => state.account.privateKey);
  const mode = useSelector(state => state.account.mode);
  const { close } = props;

  return (
    <div>
      <CommonDialog title="Recovery phrase" okText="Close" close={close} confirm={close}>
        <div>{mode === 1 ? <span>Your mnemonic </span> : <span>Your private key </span>}</div>
        <MnemonixText>
          <p data-cy="mnemonic">{mode === 1 ? mnemonic : privateKey}</p>
        </MnemonixText>
      </CommonDialog>
    </div>
  );
}
