import React, { useState } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import { AvatarPro } from './AvatarPro';

const ImgWrap = styled.div`
  width: 120px;
  height: 120px;
  img {
    transform: ${props => props.rotation && `rotate(${props.rotation}deg)`};
    border-radius: 50%;
  }
`;

const ContainerWrap = styled.div`
  display: block;
`;

const useStyles = makeStyles(() => ({
  avatar: {
    width: 120,
    height: 120,
  },
}));

export default function RotateImg(props) {
  const { src, rotation } = props;

  const classes = useStyles();

  return (
    <ContainerWrap>
      <ImgWrap>
        {/* <AvatarPro src={src} className={classes.avatar} rotation={rotation} /> */}
        <img style={{ transform: `rotate(${rotation}deg)` }} src={src} alt="roImg" />
      </ImgWrap>
    </ContainerWrap>
  );
}
