import React, { useState, useRef } from 'react';
import CommonDialog from "./CommonDialog";
import QrReader from "react-qr-reader";
import { useSnackbar } from "notistack";
import Fab from '@material-ui/core/Fab';
import styled from "styled-components";

const LegacyComponent = styled.div`
  .legacy-component {
    &__button {
      margin: 20px auto;
      display: block;
    }
    &__text {
      line-height: 1.4;
      color: grey;
      text-align: center;
    }
  }
`;

export default function ScanQRCodeModal(props) {
  const qrReader = useRef(null);
  const [legacyMode, setLegacyMode] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  function handleScan(data) {
    if (data && typeof data === 'string') {
      props.setRecoveryPhase(data);
      enqueueSnackbar('Decrypted successfully from your QR code.', { variant: 'success' });
      closeScanQRModal();
    } else if (legacyMode) {
      enqueueSnackbar('Please submit a QR code image containing your recovery phase.', { variant: 'error' });
    }
  }
  
  function handleError() {
    setLegacyMode(true);
  }
  
  function closeScanQRModal() {
    props.setIsQRCodeActive(false);
  }
  
  return (
    <CommonDialog
      title="Scan QR Code"
      okText="Close"
      close={closeScanQRModal}
      confirm={closeScanQRModal}
    >
      <QrReader
        ref={qrReader}
        delay={300}
        style={{ maxWidth: '350px', margin: '0 auto' }}
        onScan={handleScan}
        onError={handleError}
        legacyMode={legacyMode}
      />
      
      {legacyMode && (
        <LegacyComponent>
          <Fab
            className="legacy-component__button"
            color="primary"
            variant="extended"
            onClick={() => qrReader.current.openImageDialog()}
          >
            Submit QR Code
          </Fab>
          <div className="legacy-component__text">*Since you do not allow to activate the camera or it is not currently available in your device, you can submit a QR code image containing your recovery phase.</div>
        </LegacyComponent>
      )}
    </CommonDialog>
  )
}
