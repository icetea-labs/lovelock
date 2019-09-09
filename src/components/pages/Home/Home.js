import React from 'react';
import { useSelector } from 'react-redux';
import { FlexBox, FlexWidthBox } from '../../elements/StyledUtils';
import LeftContrainer from '../Propose/Detail/LeftContrainer';

export default function Home() {
  const address = useSelector(state => state.account.address);
  return (
    <FlexBox wrap="wrap">
      <FlexWidthBox width="30%">{address && <LeftContrainer />}</FlexWidthBox>
    </FlexBox>
  );
}
