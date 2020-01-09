import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { LeftBoxWrapper } from '../../elements/StyledUtils';
import LeftContainer from '../Lock/LeftContainer';
import MemoryList from '../Memory/MemoryList';
import * as actions from '../../../store/actions';

import APIService from '../../../service/apiService';

function Explore(props) {
  const { setMemory } = props;
  const [loading, setLoading] = useState(true);

  const indexParam = Number(props.match.params.index)
  const pinIndex = (indexParam > 0 && Number.isInteger(indexParam)) ? indexParam : null

  
  const [changed, setChanged] = useState(false);

  function refresh() {
    setChanged(c => !c);
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed]);

  async function fetchData() {
    APIService.getChoiceMemories(pinIndex).then(mems => {
      // set to redux
      setMemory(mems);
      setLoading(false);
    });
  }

  return (
      <LeftBoxWrapper>
        <div className="proposeColumn proposeColumn--left">
          <LeftContainer loading={loading} />
        </div>
        <div className="proposeColumn proposeColumn--right">
          <MemoryList 
            {...props}
            pinIndex={pinIndex}
            onMemoryChanged={refresh}
            loading={loading}
          />
        </div>
      </LeftBoxWrapper>
    //)
  );
}

// const mapStateToProps = state => {
//   return {
//     address: state.account.address,
//   };
// };
const mapDispatchToProps = dispatch => {
  return {
    // setLocks: value => {
    //   dispatch(actions.setLocks(value));
    // },
    setMemory: value => {
      dispatch(actions.setMemory(value));
    },
  };
};
export default connect(
  null, //mapStateToProps,
  mapDispatchToProps
)(Explore);
