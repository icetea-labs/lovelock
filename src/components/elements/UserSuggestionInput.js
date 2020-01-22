import React, {useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import { getUserSuggestions } from "../../helper";
import AvatarPro from "./AvatarPro";
import styled from "styled-components";

export const SuggestItem = styled.div`
  display: flex;
  align-items: center;
  .suggest-item__avatar {
    width: 25px;
    height: 25px;
    margin-right: 5px;
  }
`;

export default function UserSuggestionInput(props) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    
    async function fetchUsers() {
      let users = await getUserSuggestions(searchValue);
  
      users = users.filter(user => {
        let isValid = true;
        for (let i = 0; i < props.contributors.length; i++) {
          if (props.contributors[i].nick === user.nick) {
            isValid = false;
            break;
          }
        }
        return isValid;
      });
      
      setOptions(users);
      setLoading(false);
    }
    
    fetchUsers();
  }, [searchValue, props.contributors]);
  
  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);
  
  function renderSuggestionValue(user) {
    return (
      <SuggestItem>
        <AvatarPro hash={user.avatar} className={'suggest-item__avatar'}/>
        <div>{user.nick}</div>
      </SuggestItem>
    )
  }
  
  return (
    <Autocomplete
      multiple
      open={open}
      onOpen={() => {setOpen(true)}}
      onClose={() => {setOpen(false)}}
      getOptionLabel={option => renderSuggestionValue(option)}
      options={options}
      loading={loading}
      value={props.contributors}
      onChange={(e, value) => props.setContributors(value)}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={renderSuggestionValue(option)} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => (
        <TextField
          {...params}
          label="Contributors"
          fullWidth
          variant="outlined"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
