import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
// import GridList from '@material-ui/core/GridList';
// import GridListTile from '@material-ui/core/GridListTile';
// import GridListTileBar from '@material-ui/core/GridListTileBar';
// import IconButton from '@material-ui/core/IconButton';
// import CloseIcon from '@material-ui/icons/Close';

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
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e1e1e1;
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
    width: 30,
    height: 50,
  },
  titleBar: {
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' + 'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
  },
  icon: {
    color: 'white',
  },
}));
function MaterialUIPickers(props) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker {...props} />
    </MuiPickersUtilsProvider>
  );
}
const tileData = [
  {
    img: '/static/img/user-men.jpg',
    title: 'Image',
    author: 'author',
  },
  // {
  //   img: '/static/img/user-men.jpg',
  //   title: 'Image',
  //   author: 'author',
  // },
  // {
  //   img: '/static/img/user-men.jpg',
  //   title: 'Image',
  //   author: 'author',
  // },
];
export default function AddInfoMessage(props) {
  const { grayLayout = true, onChangeMedia, onChangeDate } = props;
  const [date, setDate] = useState(new Date());

  function captureUploadFile(event) {
    const files = event.target.files;
    onChangeMedia(files);
  }
  function handleDateChange(value) {
    setDate(value);
    onChangeDate(value);
  }
  // const classes = useStyles();
  return (
    <Container>
      {/* <ImgList>
        <div className={classes.root}>
          <GridList cellHeight={100} className={classes.gridList} cols={1}>
            {tileData.map((tile, index) => (
              <GridListTile key={index} className={classes.img}>
                <img src={tile.img} alt={tile.title} />
                <GridListTileBar
                  titlePosition="top"
                  actionIcon={
                    <IconButton aria-label={`close ${tile.title}`}>
                      <CloseIcon className={classes.icon} />
                    </IconButton>
                  }
                  className={classes.titleBar}
                />
              </GridListTile>
            ))}
          </GridList>
        </div>
      </ImgList> */}
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
                <i className="material-icons">insert_photo</i>
                <div>Photo/Video</div>
              </div>
              <input id="fileInput" type="file" className="fileInput" onChange={captureUploadFile} />
            </ImgUpLoad>
          </Grid>
        </Grid>
      </InfoBox>
    </Container>
  );
}
