import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { FlexBox, FlexWidthBox, rem } from '../../elements/Common';
import Icon from '../../elements/Icon';

class Main extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ownerTag: ['honeymoon', 'travel'],
      isPromise: false,
      isPendingPromise: false,
      isAccept: false,
      isDeny: false,
      reload: true,
      proIndex: -1,
      pendingIndex: -1,
      date: new Date(),
      file: '',
      memoryContent: '',
      address: '',
      propose: [],
    };
  }

  render() {
    const {
      tag,
      ownerTag,
      isPromise,
      isPendingPromise,
      isAccept,
      isDeny,
      proIndex,
      pendingIndex,
      date,
      file,
      memoryContent,
    } = this.state;
    return (
      <BannerContainer>
          <ShadowBox>
            <TopContrainer proIndex={proIndex} />
          </ShadowBox>
        </BannerContainer>

        <FlexBox wrap="wrap">
          <FlexWidthBox width="30%">
            <LeftBox>
              <ShadowBox>
                <button type="button" className="btn_add_promise" onClick={this.addPromise}>
                  <Icon type="add" />
                  Add Promise
                </button>
                <div className="title">Accepted promise</div>
                <div>
                  <PromiseLeftAccept
                    propose={propose}
                    address={address}
                    handlerSelectPropose={this.handlerSelectPropose}
                  />
                </div>
                <div className="title">Pending promise</div>
                <div>
                  <PromiseLeftPending address={address} openPendingPromise={this.openPending} />
                </div>
                <div className="title">Popular Tag</div>
                <TagBox>{this.renderTag(tag)}</TagBox>
              </ShadowBox>
            </LeftBox>
          </FlexWidthBox>
          <FlexWidthBox width="70%">
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
                        onChange={this.statusChange}
                      />
                    </div>
                  </div>
                </div>
                <CustomPost avatarShow onChange={this.onChangeCus} />
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
                        {/* <input
                            id="react-select-2-input"
                            className="css-gj7qu5-dummyInput"
                          /> */}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled=""
                  onClick={() => {
                    this.shareMemory(proIndex, memoryContent, date, file);
                  }}
                >
                  Share
                </button>
              </div>
              <MessageHistory />
            </RightBox>
          </FlexWidthBox>
        </FlexBox>
        {isPromise && <Promise close={this.closePromise} />}
        {isPendingPromise && (
          <PromiseAlert
            propose={propose}
            address={address}
            index={pendingIndex}
            close={this.closePendingPromise}
            accept={this.acceptPromise}
            deny={this.denyPromise}
          />
        )}
        {isAccept && <PromiseConfirm close={this.closeConfirm} index={pendingIndex} />}
        {isDeny && <PromiseConfirm isDeny close={this.closeConfirm} index={pendingIndex} />}
    );
  }
}

export default Main;
