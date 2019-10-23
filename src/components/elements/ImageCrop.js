import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import '../../assets/sass/cropper.css';
import styled from 'styled-components';
import QueueAnim from 'rc-queue-anim';

import { ValidatorForm } from 'react-material-ui-form-validator';
import IconButton from '@material-ui/core/IconButton';
import { ButtonPro, LinkPro } from './Button';

let cropper = React.createRef(null);
let timeout = null;

const PuLayout = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.5);
`;

const Container = styled.div`
  width: 600px;
  max-height: 730px;
  border-radius: 10px;
  box-shadow: 0 14px 52px 0 rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  box-sizing: border-box;
  position: fixed;
  top: ${props => props.isCoverImg && '10%'};
  left: 50%;
  transform: translate(-50%, -50%);
  .cropper-view-box {
    border-radius: ${props => (props.isCoverImg || props.isAddInfo) && '0'};
  }
`;

const PuTitle = styled.div`
  display: flex;
  height: 62px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: #8250c8;
  font-family: Montserrat;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  .title {
    margin-left: 8px;
  }
  .material-icons {
    cursor: pointer;
    color: white;
  }
`;

const ContWrap = styled.div`
  width: 90%;
  height: 90%;
  padding: 30px;
  img {
    height: 400px;
  }
`;

const Action = styled.div`
  .actionConfirm {
    width: 100%;
    margin: 20px 0 16px;
    justify-content: center;
    display: flex;
    button {
      width: 172px;
      line-height: 34px;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      border-radius: 23px;
    }
    .send {
      background-image: linear-gradient(340deg, #b276ff, #fe8dc3);
    }
    .deny {
      margin-right: 34px;
      background: #ffffff;
      border: 1px solid #5e5e5e;
      display: flex;
      justify-content: center;
      font-weight: 600;
      color: #373737;
    }
  }
`;

export default function ImageCrop(props) {
  const [imgPreviewUrl, setImgPreviewUrl] = useState('');
  const [avaPreview, setAvaPreview] = useState('');
  const { close, accept, originFile, isCoverImg, isAddInfo } = props;

  useEffect(() => {
    const reader = new FileReader();
    const file = originFile[0];
    if (originFile && file) {
      reader.onloadend = loadedEvent => {
        const arrayBuffer = loadedEvent.target.result;
        const blobUrl = URL.createObjectURL(new Blob([arrayBuffer]));
        setImgPreviewUrl(blobUrl);
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const acceptCrop = useCallback(async () => {
    const dataUrl = avaPreview.getCroppedCanvas().toDataURL();

    const cropFile = await base64toBlob(dataUrl);
    const cropData = { cropFile, avaPreview: dataUrl };

    accept(cropData);
  }, [avaPreview]);

  async function base64toBlob(b64Data) {
    const newName = originFile[0].name;
    const newType = originFile[0].type;
    const list = new DataTransfer();

    const response = await fetch(b64Data);
    const blob = await response.blob();
    const parseFile = new File([blob], newName, { type: newType });
    list.items.add(parseFile);
    return list.files;
  }

  function crop() {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      // const dataUrl = cropper.getCroppedCanvas().toDataURL();
      setAvaPreview(cropper);
    }, 500);
  }

  let expectRatio = 0;
  if (isCoverImg || isAddInfo) {
    expectRatio = 16 / 9;
  } else expectRatio = 1;

  return (
    <QueueAnim animConfig={{ opacity: [1, 0] }}>
      isCoverImg
      <PuLayout key={1}>
        <QueueAnim leaveReverse delay={100} type={['top', 'bottom']}>
          <Container key={2} isCoverImg={isCoverImg} isAddInfo={isAddInfo}>
            <PuTitle>
              <span className="title">Crop Image</span>
              <IconButton onClick={close}>
                <i className="material-icons">close</i>
              </IconButton>
            </PuTitle>
            <ContWrap>
              {originFile && (
                <Cropper
                  ref={value => {
                    cropper = value;
                  }}
                  src={imgPreviewUrl}
                  style={{ width: '100%', padding: '20px 0', background: '#f2f2f2' }}
                  // Cropper.js options
                  aspectRatio={expectRatio}
                  guides={false}
                  crop={() => {
                    crop();
                  }}
                  viewMode={1}
                  minContainerWidth={200}
                  minContainerHeight={300}
                  autoCropArea={1}
                  cropBoxResizable={false}
                  cropBoxMovable={false}
                  dragMode="move"
                />
              )}
              <Action>
                <div className="actionConfirm">
                  <ValidatorForm onSubmit={close}>
                    <LinkPro className="deny" type="submit">
                      Cancel
                    </LinkPro>
                  </ValidatorForm>
                  <ValidatorForm onSubmit={acceptCrop}>
                    <ButtonPro className="send" type="submit">
                      Crop
                    </ButtonPro>
                  </ValidatorForm>
                </div>
              </Action>
            </ContWrap>
          </Container>
        </QueueAnim>
      </PuLayout>
    </QueueAnim>
  );
}
