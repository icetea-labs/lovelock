import React, { useEffect, useState } from 'react';
import CommonDialog from "./CommonDialog";
import { TextField } from "@material-ui/core";
import CustomDatePicker from "./CustomDatePicker";
import UserSuggestionInput from "./UserSuggestionInput";
import styled from "styled-components";
import { useTx } from "../../helper/hooks";
import { useSnackbar } from "notistack";
import * as actions from '../../store/actions';
import { useDispatch } from "react-redux";
import APIService from "../../service/apiService";
import { getAliasAndTags } from "../../helper";
import appConstants from "../../helper/constants";

const EditLock = styled.div`
  .edit-lock {
    &__name {
      margin-bottom: 25px;
    }
    &__date {
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;
    }
    &__contributors {
      margin-top: 25px;
    }
  }
`;

export default function EditLockModal(props) {
  const topInfo = props.topInfo;
  const originalDisplayName = topInfo.s_info.lockName;
  const originalMessage = props.isSender ? topInfo.s_content : topInfo.r_content;
  const originalDate = topInfo.s_date;
  const originalContributors = topInfo.contributors;
  
  const [displayName, setDisplayName] = useState(originalDisplayName);
  const [message, setMessage] = useState(originalMessage);
  const [date, setDate] = useState(originalDate);
  const [contributors, setContributors] = useState(originalContributors);
  const [lockType, setLockType] = useState('lock');
  
  const tx = useTx();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  
  useEffect(() => {
    let type = 'lock';
  
    if (topInfo.isCrush) {
      type = 'crush';
    } else if (topInfo.isJournal) {
      type = 'journal';
    }
    
    setLockType(type);
  }, [topInfo.isCrush, topInfo.isJournal]);
  
  useEffect(() => {
    async function formatContributorList() {
      let formattedContributors = [];
  
      for (let i = 0; i < topInfo.contributors.length; i++) {
        const [username, user] = await getAliasAndTags(topInfo.contributors[i]);
        formattedContributors.push({
          nick: username,
          avatar: user.avatar,
          address: topInfo.contributors[i]
        });
      }
      
      setContributors(formattedContributors);
    }
  
    formatContributorList();
  }, [topInfo.contributors]);
  
  function editLock() {
    const editData = generateEditData();
  
    if (!message) {
      const message = 'Please input ' + getMessage('messageLabel');
      enqueueSnackbar(message, { variant: 'error' });
      return;
    }
    
    const formattedContributors = contributors.map(contributor => {
      return contributor.address;
    });
    const isContributorsEdited = checkIsContributorsEdited();
    const editContributors = isContributorsEdited ? formattedContributors : null;
   
    if (!editData && !isContributorsEdited) {
      props.close();
      return;
    }
   
    try {
      tx.sendCommit('editLock', topInfo.index, editData, editContributors)
      .then(() => {
        updateTopInfo(topInfo.index);
        const successMessage = `Your ${topInfo.isJournal ? 'Journal' : 'Lock'} has been updated successfully.`;
        enqueueSnackbar(successMessage, { variant: 'success' });
        props.close();
      })
      .catch(error => {
        enqueueSnackbar(error.message, { variant: 'error' });
      });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }
  
  function updateTopInfo(lockIndex) {
    APIService.getDetailLock(lockIndex).then(lock => {
      dispatch(actions.setTopInfo(lock));
    });
  }
  
  function generateEditData() {
    let editData = {};
    const dateByTimestamp = !Date.parse(date) ? date : Date.parse(date);
    
    if (displayName !== originalDisplayName) editData.lockName = displayName;
    if (message !== originalMessage) editData.message = message;
    if (dateByTimestamp !== originalDate) editData.date = dateByTimestamp;
    if (!Object.keys(editData).length) editData = null;
    
    return editData;
  }
  
  function checkIsContributorsEdited() {
    if (originalContributors.length !== contributors.length) return true;
    
    let isContributorsEdited = false;
  
    for (let i = 0; i < originalContributors.length; i++) {
      if (contributors[i].address !== originalContributors[i]) {
        isContributorsEdited = true;
        break;
      }
    }
    
    return isContributorsEdited;
  }
  
  function getMessage(id) {
    return appConstants.textByLockTypes[lockType][id];
  }
  
  return (
    <CommonDialog
      title={topInfo.isJournal ? 'Edit Journal' : 'Edit Lock'}
      okText="Save"
      close={props.close}
      confirm={editLock}
    >
      <EditLock>
        {topInfo.isJournal && (
          <TextField
            label={"Display Name"}
            className={"edit-lock__name"}
            fullWidth
            onChange={(e) => setDisplayName(e.target.value)}
            name="displayName"
            variant="outlined"
            value={displayName}
            autoFocus
          />
        )}
  
        <TextField
          label={getMessage('messageLabel')}
          className={"edit-lock__message"}
          placeholder={getMessage('messagePlaceholder')}
          multiline
          fullWidth
          rows="4"
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
  
        {topInfo.isJournal && (
          <div className={"edit-lock__contributors"}>
            <UserSuggestionInput
              contributors={contributors}
              setContributors={setContributors}
            />
          </div>
        )}
  
        <div className={"edit-lock__date"}>
          <CustomDatePicker
            date={date}
            handleDateChange={setDate}
          />
        </div>
      </EditLock>
    </CommonDialog>
  )
}
