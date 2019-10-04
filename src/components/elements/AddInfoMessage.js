import React, { useState } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const Container = styled.div``;
// const ImgList = styled.div`
//   width: 100%;
//   img {
//     width: 100px;
//     height: 100px;
//   }
// `;
const InfoBox = styled.div`
  min-height: 55px;
  /* margin-top: 10px; */
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* border-top: 1px solid #e1e1e1; */
  border-bottom: ${props => props.grayLayout && '1px solid #e1e1e1'};
  color: '#8250c8';
`;
const ImgUpLoad = styled.div`
  display: inline-block;
  position: relative;
  overflow: hidden;
  background: #f5f6f7;
  border-radius: 18px;
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  color: #8250c8;
  :hover {
    background: #ebedf0;
  }
  input {
    cursor: pointer;
    font-size: 50px;
    position: absolute;
    left: 10;
    top: 0;
    opacity: 0;
  }
  i {
    color: #8250c8;
  }
  .icon-upload {
    display: flex;
    align-items: center;
    padding: 0 10px;
  }
`;
const DateBox = styled.div`
  height: 32px;
  line-height: 32px;
  width: 100px;
  color: #8250c8;
  background: #f5f6f7;
  border-radius: 18px;
  padding: 0 15px 0 10px;
  position: relative;
  z-index: 0;
  :hover {
    background: #ebedf0;
  }
  cursor: pointer;
  input {
    cursor: pointer;
    text-align: right;
    z-index: 2;
    font-size: 13px;
    color: #8250c8;
  }
  .icon-datetime {
    display: flex;
    align-items: center;
  }
  i {
    position: absolute;
    left: 5px;
    top: 4px;
    z-index: 1;
  }
`;

const ImgUploadPreview = styled.div`
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
  .scrollWrap {
    width: 100%;
    overflow-y: hidden;
    overflow-x: auto;
    position: relative;
    height: 150%;
  }
  .scrollBody {
    position: relative;
    display: inline-block;
  }
  .scrollContent {
    white-space: nowrap;
  }
  .imgContent {
    display: inline-block;
    vertical-align: top;
    margin-right: 5px;
    img {
      width: 100px;
      height: 100px;
    }
  }
`;
const AddMoreImg = styled.span`
  display: inline-block;
  margin-left: 5px;
  vertical-align: top;
  height: 112px;
  /* width: 100%; */
  .addImgBox {
    position: relative;
    display: inline-block;
  }
  .btAddImg {
    margin-right: 12px;
    background-image: url('/static/img/plus.png');
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: 20px;

    border: 2px dashed #dddfe2;
    border-radius: 2px;
    box-sizing: border-box;
    display: inline-block;
    height: 100px;
    margin-right: 5px;
    min-width: 100px;
    position: relative;
    width: auto;

    cursor: pointer;
    text-decoration: none;
  }
  .wrapperInput {
    height: 100%;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
  }
  .btInput {
    bottom: 0;
    cursor: inherit;
    font-size: 1000px !important;
    height: 300px;
    margin: 0;
    opacity: 0;
    padding: 0;
    position: absolute;
    right: 0;
    outline: none;
  }
`;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  },
  img: {
    display: 'block',
    height: 100,
    '&:hover': {
      '& $icon': {
        display: 'block',
      },
    },
  },
  title: {
    color: theme.palette.primary.light,
  },
  titleBar: {
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
  icon: {
    color: 'white',
    display: 'none',
  },
}));

function MaterialUIPickers(props) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker {...props} />
    </MuiPickersUtilsProvider>
  );
}

export default function AddInfoMessage(props) {
  const { grayLayout = true, onChangeMedia, onChangeDate } = props;
  // const [date, setDate] = useState(new Date());
  const { files, date } = props;
  const [pictures, setPictures] = useState([]);
  const [picPreview, setPicPreview] = useState([]);

  function captureUploadFile(event) {
    const imgFile = event.target.files;
    if (files) {
      setPictures(pictures.concat(imgFile[0]));
    } else {
      // reset image when post new memory
      setPictures([imgFile[0]]);
    }
    onChangeMedia([...pictures, imgFile[0]]);
    // onChangeMedia(imgFile);
    showPreview(imgFile);
  }

  function showPreview(imgFile) {
    const file = imgFile[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (files) {
        setPicPreview(picPreview.concat({ img: reader.result }));
      } else {
        // reset preview when post new memory
        setPicPreview([{ img: reader.result }]);
      }
    };
    if (file) reader.readAsDataURL(file);
  }

  function handleDateChange(value) {
    onChangeDate(value);
  }

  const classes = useStyles();
  return (
    <Container>
      {files && (
        <ImgUploadPreview>
          <div className="scrollWrap">
            <div className="scrollBody">
              <div className="scrollContent">
                {picPreview.map((tile, index) => (
                  <div key={index} className="imgContent">
                    <GridListTile className={classes.img}>
                      <img src={tile.img} alt="" />
                      <GridListTileBar
                        className={classes.titleBar}
                        titlePosition="top"
                        actionIcon={
                          <IconButton
                            onClick={() => {
                              const filtered = picPreview.filter((value, id) => {
                                return id !== index;
                              });
                              setPicPreview(filtered);
                            }}
                          >
                            <CloseIcon className={classes.icon} />
                          </IconButton>
                        }
                      />
                    </GridListTile>
                  </div>
                ))}
                <AddMoreImg>
                  <div className="addImgBox">
                    <div className="btAddImg" rel="ignore">
                      <div className="wrapperInput">
                        <input
                          accept="video/*,  video/x-m4v, video/webm, video/x-ms-wmv, video/x-msvideo, video/3gpp, video/flv, video/x-flv, video/mp4, video/quicktime, video/mpeg, video/ogv, .ts, .mkv, image/*, image/heic, image/heif"
                          title="Choose a file to upload"
                          display="inline-block"
                          type="file"
                          className="btInput"
                          onChange={captureUploadFile}
                        />
                      </div>
                    </div>
                  </div>
                </AddMoreImg>
              </div>
            </div>
          </div>
        </ImgUploadPreview>
      )}
      <InfoBox grayLayout={grayLayout}>
        <Grid container spacing={3} alignItems="center" justify="flex-end">
          <Grid item>
            <DateBox>
              <div className="icon-datetime">
                <MaterialUIPickers
                  autoOk
                  clearable
                  value={date}
                  format="dd/MM/yyyy"
                  disableFuture
                  onChange={handleDateChange}
                />
                <i className="material-icons">event</i>
              </div>
            </DateBox>
          </Grid>
          <Grid item>
            <ImgUpLoad>
              <div className="icon-upload">
                <div>Photo/Video</div>
              </div>
              <input id="fileInput" type="file" className="fileInput" onChange={captureUploadFile} accept="image/*" />
            </ImgUpLoad>
          </Grid>
        </Grid>
      </InfoBox>
    </Container>
  );
}
