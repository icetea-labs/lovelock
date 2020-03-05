import React, { useMemo } from 'react';
import styled from "styled-components";
import { MentionsInput, Mention } from 'react-mentions'

import { getUserSuggestions } from "../../../helper";
import { AvatarPro } from "../AvatarPro";

const SuggestItem = styled.div`
  display: flex;
  align-items: center;
  padding-right: 10px;
  .suggest-item__avatar {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
  .suggest-item__name {
    line-height: 1.3;
  }
  .suggest-item__nick {
    font-size: 85%
  }
`;

const textAreaStyles = styled.div`
  .suggestion-textarea {
    min-height: 60px;
    max-height: 110px;
    font-size: 16px;
    word-break: break-word;
    &__highlighter {
       padding: 6px 0 7px 8px;
    }
    &__input {
      border: none;
      padding: 6px 0 7px 8px;
      &::placeholder {
        opacity: 0.6;
      }
    }
    &__suggestions {
      box-shadow: 0 2px 3px #ccc;
      margin-top: 25px !important;
      font-size: 13px;
      &__item {
        padding: 7px 10px;
        &--focused {
          background: #eaeaea;
        }
      }
    }
  }
`;

const inputStyles = styled.div`
  .suggestion-textarea {
    font-size: 14px;
    word-break: break-word;
    border-radius: 20px;
    background: #f5f6f7;
    margin: 8px 0 4px;
    &__highlighter {
       padding: 12px 15px;
    }
    &__input {
      border: 1px solid transparent;
      padding: 10px 15px;
      border-radius: 20px;
      transition: border-color .3s;
      &::placeholder {
        opacity: 0.6;
      }
      &:focus {
        border-color: #8250c8;
      }
    }
    &__suggestions {
      box-shadow: 0 2px 3px #ccc;
      margin-top: 25px !important;
      font-size: 13px;
      &__item {
        padding: 7px 10px;
        &--focused {
          background: #eaeaea;
        }
      }
    }
  }
`;

export default function UserSuggestionTextarea(props) {
  const { value, onChange, onFocus, placeholder, inputRef, onKeyDown, isInput } = props;
  
  const TextAreaContainer = useMemo(() => {
    return isInput ? inputStyles : textAreaStyles;
  }, [isInput]);
  
  function renderSuggestion(suggestion) {
    return (
      <SuggestItem>
        <AvatarPro hash={suggestion.avatar} className='suggest-item__avatar' />
        <div className='suggest-item__name'>{suggestion.display}<div className='suggest-item__nick'>@{suggestion.id}</div></div>
      </SuggestItem>
    )
  }
  
  async function fetchUsers(search, callback) {
    if (!search.length) return;
    const users = await getUserSuggestions(search, 'id');
    callback(users);
  }

  return (
    <TextAreaContainer>
      <MentionsInput
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        className="suggestion-textarea"
        inputRef={inputRef}
        onKeyDown={onKeyDown}
      >
        <Mention
          trigger="@"
          data={fetchUsers}
          markup="@[__id__-__display__]"
          renderSuggestion={renderSuggestion}
          style={{backgroundColor: '#e9e1f7', borderRadius: '2px'}}
          appendSpaceOnAdd
        />
      </MentionsInput>
    </TextAreaContainer>
  );
}
