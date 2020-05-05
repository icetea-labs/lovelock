import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { FlexWidthBox, rem } from '../elements/StyledUtils';
import { ButtonPro, LinkPro } from '../elements/Button/index';
import { useDispatch } from 'react-redux';
import { Alert, AlertTitle } from '@material-ui/lab';
import * as actions from '../../store/actions';

const RightBox = styled.div`
  text-align: center;
  padding: ${rem(30)};
  h1,
  h2 {
    text-align: center;
  }
  .emptyTitle {
    margin: 16px auto;
    font-size: 25px;
    line-height: 32px;
    font-weight: 60px;
  }
  .emptySubTitle {
    color: #506175;
    font-size: 18px;
    line-height: 24px;
    margin: 16px auto;
  }
  img {
    max-width: 158px;
  }
  .note {
    text-align: left;
    font-size: 1em;
    h5 {
      font-weight: 700;
      font-size: 1.1em;
    }
    strong {
      font-weight: 700;
    }
  }
  @media (max-width: 768px) {
    img {
      width: 25vw;
    }
  }
`;

const ActionForm = styled.div`
  margin-top: 20px;
`;

const SupportSite = styled.div`
  display: flex;
  margin: 3px 0;
  line-height: 18px;
  align-items: center;
  justify-content: center;
  width: auto;
  a {
    color: inherit;
    &:hover {
      color: #8250c8;
      text-decoration: underline;
    }
  }
  .footRight {
    margin-left: 15px;
  }
`;

const FooterWapper = styled.div`
  height: 20px;
  line-height: 20px;
  padding-top: 30px;
  /* background: #fff; */
  width: 100%;
  color: #737373;
  font-size: 12px;
  font-weight: 300px;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  /* position: fixed; */
  left: 0;
  z-index: 1;
  @media (max-width: 768px) {
    justify-content: flex-start;
    display: none;
  }
`;

const ShadowBox = styled.div`
  margin-top: ${rem(40)};
  padding: ${rem(30)};
  border-radius: 10px;
  background: #f5f5f8;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
  @media (max-width: 768px) {
    margin-top: 0;
    height: 125%;
  }
`;

const DownInfo = styled.div`
  height: 20px;
  width: 100%;
  color: #737373;
  font-size: 12px;
  font-weight: 300px;
  border-top: 1px solid #e6ecf0;
  justify-content: center;
  left: 0;
  @media (max-width: 768px) {
    justify-content: flex-start;
    display: none;
  }
`;

export default function EmptyPage(props){
  const dispatch = useDispatch();
  const { history, isApproved, isGuest, username } = props;

  function openPopup() {
    dispatch(actions.setShowNewLockDialog(true));
  }

  function openLink(event) {
    event.preventDefault();
    history.push(event.currentTarget.getAttribute('route'));
  }

  return (
    <FlexWidthBox>
      <ShadowBox>
        <RightBox>
            {(!isApproved && !isGuest) ? (
              <Alert severity="info" variant="outlined" className="note">
                <AlertTitle>
                  <h5><FormattedMessage id="home.activationTitle" /></h5>
                </AlertTitle>
                <span>
                  <FormattedMessage id="home.activationSubTitle" />
                  <a
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://bit.ly/LoveLock-AAR"
                  >
                    <strong><FormattedMessage id="home.activationForm" /></strong>
                  </a>
                  <FormattedMessage id="home.activationGoal" />
                </span>
              </Alert>
            ) : (
              <div>
                <img src="/static/img/plant.svg" alt="plant" />
                <div className="emptyTitle">
                    {
                      isGuest ? <h1>{username || 'This user'} has no lock.</h1> : <h1><FormattedMessage id="home.emptyTitle" /></h1>
                    }
                </div>
                <div className="emptySubTitle">
                  {isGuest ? (
                    <h2>{username || 'This user'} has not created any content.</h2>
                  ) : (
                    <h2>
                      <span>
                        <FormattedMessage id="home.emptySubTitle" />
                      </span>
                      <a href="https://help.lovelock.one/" className="underline" target="_blank" rel="noopener noreferrer">
                        <FormattedMessage id="home.emptySubTitleLink" />
                      </a>
                    </h2>
                  )}
                </div>
                {isGuest ? (
                  <LinkPro variant="contained" color="primary" route="/explore" onClick={openLink}>
                    <FormattedMessage id="home.exploreLink" />
                  </LinkPro>
                ) : (
                  <>
                    <ActionForm>
                      <ButtonPro variant="contained" color="primary" onClick={openPopup}>
                        <FormattedMessage id="home.buttonCreate" />
                      </ButtonPro>
                    </ActionForm>
                    <LinkPro className="btn_add_promise" route="/explore" onClick={openLink}>
                      <FormattedMessage id="home.exploreLink" />
                    </LinkPro>
                  </>
                )}
              </div>
            )}
        </RightBox>
      </ShadowBox>
      <FooterWapper>
        <SupportSite className="upInfo">
          <p>
            Powered by&nbsp;
            <a href="https://icetea.io/" target="_blank" rel="noopener noreferrer">
              Icetea Platform.
            </a>
          </p>
          <p>
            &nbsp;
            <a href="https://trada.tech" target="_blank" rel="noopener noreferrer">
              Trada Technology&nbsp;
            </a>
            &copy; 2019
          </p>
        </SupportSite>
      </FooterWapper>
      <DownInfo>
        <SupportSite>
          <p>
            <FormattedMessage id="home.supportTitle" />
            <a href="https://help.lovelock.one" target="_blank" rel="noopener noreferrer">
              <FormattedMessage id="home.supportHelp" />
            </a>
            &nbsp;ー&nbsp;
            <a href="mailto:info@icetea.io" target="_blank" rel="noopener noreferrer">
              <FormattedMessage id="home.supportEmail" />
            </a>
            <FormattedMessage id="home.supportOr" />
            <a href="https://t.me/iceteachainvn" target="_blank" rel="noopener noreferrer">
              <FormattedMessage id="home.supportTelegram" />
            </a>
          </p>
        </SupportSite>
      </DownInfo>
    </FlexWidthBox>
  );
}