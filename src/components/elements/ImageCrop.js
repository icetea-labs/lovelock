import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import '../../assets/sass/cropper.css';
import CommonDialog from '../pages/Propose/CommonDialog';

let cropper = React.createRef(null);
let timeout = null;

export default function ImageCrop(props) {
  // const [originFile, setOriginFile] = useState([]);
  const [imgPreviewUrl, setImgPreviewUrl] = useState('');
  const [avaPreview, setAvaPreview] = useState('');
  const { close, accept, originFile } = props;

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

  // function handleImageChange(event) {
  //   event.preventDefault();
  //   const reader = new FileReader();
  //   const orFiles = event.target.files;
  //   const file = orFiles[0];
  //   if (file && orFiles) {
  //     setOriginFile(orFiles);
  //     reader.onloadend = () => {
  //       setImgPreviewUrl(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  function crop() {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      // const dataUrl = cropper.getCroppedCanvas().toDataURL();
      setAvaPreview(cropper);
    }, 500);
  }

  return (
    <CommonDialog
      title="Create Avatar"
      okText="Accept"
      cancelText="Cancel"
      close={close}
      cancel={close}
      confirm={acceptCrop}
      isCancel
    >
      {/* <input className="fileInput" type="file" onChange={handleImageChange} accept="image/*" /> */}
      {originFile && (
        <Cropper
          ref={value => {
            cropper = value;
          }}
          src={imgPreviewUrl}
          style={{ width: '100%', padding: '20px 0', background: '#f2f2f2' }}
          // Cropper.js options
          aspectRatio={1}
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
    </CommonDialog>
  );
}
