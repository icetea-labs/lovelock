import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import OtpEmail from './OtpEmail';
import OtpPhone from './OtpPhone';
import { StyledTab, StyledTabs } from '../../elements/Tabs';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    maxWidth: 500,
  },
  tabForm: {
    backgroundColor: '#43256D',
  },
});

export default function IconLabelTabs() {
  const [isSentOtp, setIsSent] = useState(false);
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setIsSent(false);
    setValue(newValue);
  };

  return (
    <div className={[classes.root, classes.tabForm]}>
      <StyledTabs value={value} onChange={handleChange} variant="fullWidth" aria-label="icon label tabs example">
        <StyledTab label="Phone number" value={0} />
        <StyledTab label="Email" value={1} />
      </StyledTabs>
      <TabContext value={value}>
        <TabPanel value={0}>
          <OtpPhone setIsSent={setIsSent} isSentOtp={isSentOtp} />
        </TabPanel>
        <TabPanel value={1}>
          <OtpEmail setIsSent={setIsSent} isSentOtp={isSentOtp} />
        </TabPanel>
      </TabContext>
    </div>
  );
}
