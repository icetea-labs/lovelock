import React, { useState, useRef } from 'react';
import CommonDialog from "./CommonDialog";
import { useSnackbar } from "notistack";


export default function OldUserModal(props) {
  return (
    <CommonDialog
      title="Already have account?"
      okText="Login new account"
      cancelText="Sync account"
      cancel={props.syncAccount}
      close={() => props.setIsOldUserActive(false)}
      confirm={props.loginNewAccount}
    >
      <div>
        Sync your account with IceteaID
      </div>
    </CommonDialog>
  )
}
