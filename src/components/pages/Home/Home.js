import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import { LinkPro } from '../../elements/Button';
import { callView } from '../../../helper';
import * as actions from '../../../store/actions';
import PuNewLock from '../Propose/PuNewLock';

const RightBox = styled.div`
  padding: 0 ${rem(15)} ${rem(45)} ${rem(45)};
`;

function Home(props) {
  const [openPromise, setOpenPromise] = useState(false);
  const { address, history, setNeedAuth, privateKey } = props;
  const [homePropose, setHomePropose] = useState([]);

  useEffect(() => {
    loadAcceptPropose();
  }, []);

  async function loadAcceptPropose() {
    let proposes;
    proposes = (await callView('getProposeByAddress', [address])) || [];
    proposes = proposes.filter(item => item.status === 1);
    setHomePropose(proposes);
    if (proposes.length > 0) {
      const index = proposes[0].id;
      history.push(`/lock/${index}`);
    }
  }

  function openPopup() {
    if (!privateKey) {
      setNeedAuth(true);
    }
    setOpenPromise(true);
  }

  function openExplore() {
    history.push('/explore');
  }

  function closePopup() {
    setOpenPromise(false);
    loadAcceptPropose();
  }

  return (
    address && (
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">{/* <LeftContrainer /> */}</FlexWidthBox>
        {homePropose.length < 1 && (
          <FlexWidthBox width="70%">
            <RightBox>
              <div>
                <span>
                  You have no lock yet.
                  <LinkPro className="btn_add_promise" onClick={openPopup}>
                    Create one
                  </LinkPro>
                  or
                  <LinkPro className="btn_add_promise" onClick={openExplore}>
                    explorer
                  </LinkPro>
                  others.
                </span>
              </div>
            </RightBox>
            {openPromise && privateKey && <PuNewLock close={closePopup} />}
          </FlexWidthBox>
        )}
      </FlexBox>
    )
  );
}

const mapStateToProps = state => {
  const { loveinfo, account } = state;
  return {
    propose: loveinfo.propose,
    address: account.address,
    privateKey: account.privateKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setNeedAuth: value => {
      dispatch(actions.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
