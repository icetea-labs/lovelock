import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import { OneLineButton } from './StyledUtils';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { ButtonPro } from './Button';
import { setStep } from '../../store/actions';
import { useDispatch } from 'react-redux';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const ContWrap = styled.div`
  text-align: center;
  padding: 0 30px 30px 30px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #2d1949;
`;

const SubTitle = styled.div`
  font-size: 11px;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #2d1949;
  margin-top: 5px;
`;

export default function SyncAccountModal({ open, setOpen }) {
  const history = useHistory();
  const dispatch = useDispatch();

  const handleClose = () => {
    setOpen(false);
  };
  const loginNewAccount = () => {
    dispatch(setStep('four'));
    history.push('/');
  };

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth={'xs'}
        Width
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" />
        <DialogContent>
          <ContWrap>
            <Title>Already have account?</Title>
            <SubTitle>Sync your account with IceteaID.</SubTitle>
            <OneLineButton>
              <Button onClick={loginNewAccount} fullWidth color="primary" variant="outlined">
                <FormattedMessage id="login.newAccount" />
              </Button>
              <ButtonPro
                onClick={() => history.push('/syncAccount')}
                fullWidth
                variant="contained"
                color="primary"
                className="nextBtn"
                type="submit"
              >
                <FormattedMessage id="login.syncNow" />
              </ButtonPro>
            </OneLineButton>
          </ContWrap>
        </DialogContent>
      </Dialog>
    </div>
  );
}
