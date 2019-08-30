import React, { PureComponent } from 'react';
import { FlexBox, FlexWidthBox, rem } from '../../elements/StyledUtils';
import LeftContrainer from '../Propose/Detail/LeftContrainer';
class Home extends PureComponent {
  render() {
    return (
      <FlexBox wrap="wrap">
        <FlexWidthBox width="30%">
          <LeftContrainer />
        </FlexWidthBox>
      </FlexBox>
    );
  }
}

export default Home;
