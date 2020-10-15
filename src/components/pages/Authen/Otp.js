import React, {useState} from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PhoneIcon from '@material-ui/icons/Phone';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import { FormattedMessage } from 'react-intl';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import { DivControlBtnKeystore } from '../../elements/StyledUtils';
import { ButtonPro } from '../../elements/Button';
import { IceteaId } from 'iceteaid-web';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import * as actionCreate from '../../../store/actions/create';
import OtpEmail from './OtpEmail';
import OtpPhone from './OtpPhone';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    maxWidth: 500,
  },
});

const i = new IceteaId('xxx');

export default function IconLabelTabs() {
  const history = useHistory();
  const [phone, setPhone] = useState('');
  const [email, setEmail]= useState('');
  const [otp, setOtp] = useState('');
  const [isSentOtp, setIsSent] = useState(false);
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const step = useSelector(state => state.create.step);
  const isSync = useSelector(state => state.account.isSyncAccount);


  const handleChange = (event, newValue) => {
    setIsSent(false);
    setValue(newValue);
  };

  return (
    <Paper square className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        indicatorColor="secondary"
        textColor="secondary"
        aria-label="icon label tabs example"
      >
        <Tab icon={<PhoneIcon />} label="Phone number"  value={0}>
        </Tab>
        <Tab icon={<PersonPinIcon />} label="Email" value={1}/>
      </Tabs>
      <TabContext value={value}>
        <TabPanel value={0}>
          <OtpPhone
            setIsSent={setIsSent}
            isSentOtp={isSentOtp}
          />
        </TabPanel>
        <TabPanel value={1}>
          <OtpEmail
            setIsSent={setIsSent}
            isSentOtp={isSentOtp}
          />
        </TabPanel>
      </TabContext>
    </Paper>
  );
}
