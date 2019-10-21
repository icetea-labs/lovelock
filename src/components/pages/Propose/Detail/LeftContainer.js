import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import tweb3 from '../../../../service/tweb3';
import { rem } from '../../../elements/StyledUtils';
import { callView, getTagsInfo, getAlias } from '../../../../helper';
import Icon from '../../../elements/Icon';
import { LinkPro } from '../../../elements/Button';
import LeftProposes from './LeftProposes';
import * as actions from '../../../../store/actions';
import PuNewLock from '../PuNewLock';
import PromiseAlert from '../PromiseAlert';
import PromiseConfirm from '../PromiseConfirm';

const LeftBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  margin-bottom: ${rem(100)};
  i {
    padding: 0 5px;
  }
  .btn_add_promise {
    width: 172px;
    height: 46px;
    border-radius: 23px;
    font-weight: 600;
    font-size: ${rem(14)};
    color: #8250c8;
    border: 1px solid #8250c8;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
  }
  .title {
    color: #141927;
    font-weight: 600;
    font-size: ${rem(14)};
    text-transform: uppercase;
    /* margin-bottom: ${rem(20)}; */
  }
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  background: #fff;
  box-shadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15)';
`;
// const TagBox = styled.div`
//   width: 100%;
//   display: flex;
//   flex-wrap: wrap;
//   .tagName {
//     color: #8250c8;
//     margin-right: ${rem(7)};
//     font-size: ${rem(12)};
//     :hover {
//       cursor: pointer;
//     }
//   }
// `;

function LeftContainer(props) {
  const {
    proposes,
    setPropose,
    addPropose,
    confirmPropose,
    address,
    tokenAddress,
    tag,
    tokenKey,
    setNeedAuth,
    history,
  } = props;
  const [index, setIndex] = useState(-1);
  const [step, setStep] = useState('');
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadProposes();
    watchCreatePropose();
    watchConfirmPropose();
  }, []);

  function watchCreatePropose() {
    const filter = {};
    return tweb3.contract(process.env.REACT_APP_CONTRACT).events.createPropose(filter, async (error, result) => {
      if (error) {
        const message = 'Watch createPropose error';
        enqueueSnackbar(message, { variant: 'error' });
      } else {
        eventCreatePropose(result);
      }
    });
  }
  function watchConfirmPropose() {
    const filter = {};
    return tweb3.contract(process.env.REACT_APP_CONTRACT).events.confirmPropose(filter, async (error, result) => {
      if (error) {
        const message = 'Watch confirmPropose error';
        enqueueSnackbar(message, { variant: 'error' });
      } else {
        eventConfirmPropose(result);
      }
    });
  }

  function closePopup() {
    setStep('');
  }

  function nextToAccept() {
    setStep('accept');
  }

  function nextToDeny() {
    setStep('deny');
  }

  function selectAccepted(proIndex) {
    history.push(`/lock/${proIndex}`);
  }

  function newLock() {
    if (!tokenKey) {
      setNeedAuth(true);
    }
    setStep('new');
  }

  function selectPending(proIndex) {
    if (!tokenKey) {
      setNeedAuth(true);
    }
    setStep('pending');
    setIndex(proIndex);
    // console.log('view pending index', index);
  }

  function eventConfirmPropose(data) {
    confirmPropose(data.log);
    if (address === data.log.sender) {
      const message = 'Your lock request has been accepted.';
      enqueueSnackbar(message, { variant: 'info' });
    }
  }

  async function eventCreatePropose(data) {
    const log = await addInfoToProposes([data.log]);
    addPropose(log[0]);

    if (address !== log[0].sender) {
      const message = 'You have a new lock.';
      enqueueSnackbar(message, { variant: 'info' });
    }
    // goto propose detail when sent to bot.
    if (log[0].receiver === process.env.REACT_APP_BOT_LOVER) {
      history.push(`/lock/${log[0].id}`);
    }
  }

  async function loadProposes() {
    setLoading(true);
    const resp = (await callView('getProposeByAddress', [address])) || [];
    const newPropose = await addInfoToProposes(resp);

    setPropose(newPropose);
    setLoading(false);
  }

  async function addInfoToProposes(resp) {
    const clonePro = resp;
    for (let i = 0; i < clonePro.length; i++) {
      // Get address partner
      let partnerAddress = '';
      if (clonePro[i].receiver === process.env.REACT_APP_BOT_LOVER) {
        partnerAddress = clonePro[i].sender;
      } else {
        partnerAddress = clonePro[i].sender === address ? clonePro[i].receiver : clonePro[i].sender;
      }
      const botInfo = clonePro[i].bot_info;
      if (clonePro[i].receiver === process.env.REACT_APP_BOT_LOVER) {
        clonePro[i].name = `${botInfo.firstname} ${botInfo.lastname}`;
        clonePro[i].avatar = botInfo.botAva;
      } else {
        // Get info tags partner. case on receiver is bot address -> get tags info of sender address
        // eslint-disable-next-line no-await-in-loop
        const reps = await getTagsInfo(partnerAddress);
        clonePro[i].name = reps['display-name'];
        clonePro[i].avatar = reps.avatar;
        // eslint-disable-next-line no-await-in-loop
        const nick = await getAlias(partnerAddress);
        clonePro[i].nick = `@${nick}`;
      }
    }
    return clonePro;
  }

  //function renderTag() {
    // const { tag } = state;
    // return tag.map((item, index) => {
    //   return (
    //     <span className="tagName" key={index}>
    //       #{item}
    //     </span>
    //   );
    // });
  //}

  return (
    <React.Fragment>
      <LeftBox>
        <ShadowBox>
          <LinkPro className="btn_add_promise" onClick={newLock}>
            <Icon type="add" />
            New Lock
          </LinkPro>
          <div className="title">My lock</div>
          <div>
            <LeftProposes loading={loading} flag={1} handlerSelect={selectAccepted} />
          </div>
          <div className="title">Pending lock</div>
          <div>
            <LeftProposes loading={loading} flag={0} handlerSelect={selectPending} />
          </div>
        </ShadowBox>
      </LeftBox>
      {step === 'new' && tokenKey && <PuNewLock close={closePopup} />}
      {step === 'pending' && tokenKey && (
        <PromiseAlert
          index={index}
          propose={proposes}
          address={address}
          tokenAddress={tokenAddress}
          close={closePopup}
          accept={nextToAccept}
          deny={nextToDeny}
        />
      )}
      {step === 'accept' && <PromiseConfirm close={closePopup} index={index} />}
      {step === 'deny' && <PromiseConfirm isDeny close={closePopup} index={index} />}
    </React.Fragment>
  );
}

const mapStateToProps = state => {
  return {
    proposes: state.loveinfo.propose,
    address: state.account.address,
    tokenAddress: state.account.tokenAddress,
    tokenKey: state.account.tokenKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPropose: value => {
      dispatch(actions.setPropose(value));
    },
    addPropose: value => {
      dispatch(actions.addPropose(value));
    },
    confirmPropose: value => {
      dispatch(actions.confirmPropose(value));
    },
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeftContainer)
);
