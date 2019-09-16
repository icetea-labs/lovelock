import React, { useState } from 'react';
import styled from 'styled-components';

const PreviewContainter = styled.div`
  display: flex;
  flex-direction: row;
  -webkit-box-pack: justify;
  /* justify-content: space-between; */
  padding: 20px 0 0 0;
  font-size: 14px;
  cursor: pointer;
  .upload_img input[type='file'] {
      font-size: 100px;
      position: absolute;
      left: 10;
      top: 0;
      opacity: 0;
      cursor: pointer;
    }
    .upload_img {
      position: relative;
      overflow: hidden;
      display: inline-block;
      cursor: pointer;
    }
  .fileInput {
    width: 100px;
    height: 100px;
    border: 1px solid #eddada8f;
    padding: 2px;
    margin: 10px;
    cursor: pointer;
  }
  .imgPreview {
    text-align: center;
    margin-right: 15px;
    height: 150px;
    width: 150px;
    border: 1px solid #eddada8f;
    border-radius: 50%;
    cursor: pointer;
    img {
      width: 100%
      height: 100%
      cursor: pointer;
      border-radius: 50%;
    }
  }
  .previewText {
    margin-top: 70px;
    cursor: pointer;
    color: #736e6e
  }
`;

export default function ImageUpload(props) {
  const [file, setFile] = useState('');
  const [imgPreviewUrl, setImgPreviewUrl] = useState('');


  function handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      setFile(file);
      setImgPreviewUrl(reader.result);
    };

    file && reader.readAsDataURL(file);
  }

  let $imagePreview = null;
  if (imgPreviewUrl) {
    $imagePreview = <img src={imgPreviewUrl} alt="imgPreview" />;
  } else {
    $imagePreview = <div className="previewText">Your avatar</div>;
  }

  return (
    <PreviewContainter>
      <div className="upload_img">
        <input className="fileInput" type="file" onChange={handleImageChange} />
        <div className="imgPreview">{$imagePreview}</div>
      </div>
    </PreviewContainter>
  );
}
