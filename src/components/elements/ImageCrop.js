import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import '../../assets/sass/cropper.css';
import styled from 'styled-components';
import CommonDialog from './CommonDialog';

let cropper = React.createRef(null);
let timeout = null;

const ContWrap = styled.div`
  img {
    height: 400px;
  }
  .cropper-view-box {
    border-radius: ${props => props.isViewSquare && '0'};
  }
`;

export default function ImageCrop(props) {
  const [imgPreviewUrl, setImgPreviewUrl] = useState('');
  const [avaPreview, setAvaPreview] = useState('');
  const { close, accept, originFile, isViewSquare, hasParentDialog } = props;

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
  }, [originFile]);

  const acceptCrop = useCallback(() => {
    avaPreview.getCroppedCanvas().toBlob(blob => {
      const { name, type } = originFile[0];
      const parseFile = new File([blob], name, { type });
      const url = URL.createObjectURL(blob);
      const cropData = { cropFile: [parseFile], avaPreview: url };
      accept(cropData);
    });
  }, [avaPreview, originFile, accept]);

  function crop() {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      // const dataUrl = cropper.getCroppedCanvas().toDataURL();
      setAvaPreview(cropper);
    }, 500);
  }

  let expectRatio = 1;
  if (isViewSquare) {
    expectRatio = 16 / 9;
  }

  return (
    <CommonDialog
      title="Crop Image"
      okText="Crop"
      cancelText="Cancel"
      confirm={acceptCrop}
      cancel={close}
      close={close}
      hasParentDialog={hasParentDialog}
    >
      <ContWrap isViewSquare={isViewSquare}>
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
      </ContWrap>
    </CommonDialog>
  );
}
