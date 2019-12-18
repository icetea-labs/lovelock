import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import QRCode from 'qrcode.react';
import CommonDialog from '../elements/CommonDialog';

const MnemonixText = styled.div`
  text-align: center;
  position: relative;
  /* background: rgb(249, 249, 249); */
  /* border-width: 1px; */
  /* border-style: dashed; */
  /* border-color: rgb(216, 216, 216); */
  /* padding: 15px; */
  margin: 10px 0;
  p {
    line-height: 25px;
    font-size: 18px;
    word-spacing: 6px;
    font-weight: 900;
  }
`;

const QRWrapper = styled.div`
  text-align: center;
  margin: 15px 0;
`;

export default function ShowMnemonic(props) {
  const mnemonic = useSelector(state => state.account.mnemonic);
  const privateKey = useSelector(state => state.account.privateKey);
  const mode = useSelector(state => state.account.mode);
  const [showPhrase, setShowPhrase] = useState(false);
  const { close } = props;

  function viewPhrase() {
    setShowPhrase(!showPhrase);
  }

  return (
    <div>
      <CommonDialog title="Recovery phrase" okText="Close" close={close} confirm={close}>
        <div>
          <span>Scan this QR </span>
        </div>
        <QRWrapper>
          <QRCode size={150} level="M" className="qrForm" value={mode === 1 ? mnemonic : privateKey} />
        </QRWrapper>
        <MnemonixText>
          {showPhrase && <p data-cy="mnemonic">{mode === 1 ? mnemonic : privateKey}</p>}
          <div>
            <Button onClick={viewPhrase} size="large" color="secondary">
              {showPhrase ? 'Hide text' : 'Show text'}
            </Button>
          </div>
        </MnemonixText>
      </CommonDialog>
    </div>
  );
}
