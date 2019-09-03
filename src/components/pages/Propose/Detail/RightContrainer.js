import React, { PureComponent } from 'react';
import styled from 'styled-components';
import InputBase from '@material-ui/core/InputBase';
import MessageHistory from '../../Memory/MessageHistory';
import CustomPost from './CustomPost';
import { rem } from '../../../elements/StyledUtils';

const RightBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  box-sizing: border-box;
  padding-left: ${rem(30)};
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .post_container {
    display: flex;
    width: 100%;
    .user_avatar {
      img {
        width: 58px;
        height: 58px;
      }
      border-radius: 10px;
      overflow: hidden;
      margin-right: ${rem(10)};
    }
    .post_input {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      .contentEditable {
        width: 100%;
        height: 19px;
        font-family: Montserrat;
        font-size: 16px;
        font-weight: 500;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: normal;
        color: #8f8f8f;
        outline: none;
        font-size: ${rem(16)};
      }
    }
  }
  .action {
    width: 100%;
    margin: 16px 0 16px;
    display: inline-block;
    .privacy {
      display: inline-block;
    }
    button {
      width: 254px;
      line-height: 46px;
      float: right;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      border-radius: 23px;
      box-shadow: 0 5px 14px 0 rgba(0, 0, 0, 0.06);
      background-image: -webkit-linear-gradient(118deg, #b276ff, #fe8dc3);
      background-image: linear-gradient(332deg, #b276ff, #fe8dc3);
    }
    .btn_post_policy {
      width: 102px;
      height: 36px;
      border-radius: 21px;
      background: #ffffff;
      border: 1px solid #8250c8;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Montserrat;
      font-size: 12px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #8f36b3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
    }
  }
`;
function statusChange() {}
function onChangeCus() {}
export default function RightContrainer() {
  return (
    <RightBox>
      <div className="memorypost__content">
        <div className="post_container clearfix">
          <div className="user_avatar">
            <img src="/static/img/user-men.jpg" alt="itea" />
          </div>
          <div className="post_input fl">
            <div className="contentEditable">
              <InputBase
                fullWidth
                margin="dense"
                defaultValue="Describe your Memory…."
                inputProps={{ 'aria-label': 'naked' }}
                onChange={statusChange}
              />
            </div>
          </div>
        </div>
        <CustomPost avatarShow onChange={onChangeCus} />
      </div>

      <div className="action">
        <div className="privacy">
          <div className="css-1pcexqc-container privacy_select">
            <div className="css-bg1rzq-control">
              <div className="css-1hwfws3">
                <div>
                  <button type="button" disabled="" className="btn_post_policy">
                    Public
                    <div className="css-1wy0on6">
                      <span className="css-bgvzuu-indicatorSeparator" />
                      <div aria-hidden="true" className="css-16pqwjk-indicatorContainer">
                        <i className="material-icons">arrow_drop_down</i>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled=""
          onClick={() => {
            // this.shareMemory(proIndex, memoryContent, date, file);
          }}
        >
          Share
        </button>
      </div>
      <MessageHistory />
    </RightBox>
  );
}
