import React, { useState } from "react";
import styled from "styled-components";
import ipfs from "../../service/ipfs";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const Container = styled.div`
  .custom_post {
    min-height: 55px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #e1e1e1;
    border-bottom: 1px solid #e1e1e1;
    .upload_img input[type="file"] {
      font-size: 100px;
      position: absolute;
      left: 10;
      top: 0;
      opacity: 0;
    }

    .upload_img {
      position: relative;
      overflow: hidden;
      display: inline-block;
    }
    i {
      color: #8250c8;
    }
    .tags {
      display: flex;
      width: 70%;
      font-size: 12px;
      font-family: Montserrat;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #545454;
    }
    .tags_tilte {
      text-transform: uppercase;
      font-weight: 500;
    }
    .tagName {
      width: 132px;
      height: 15px;
      margin: 10px;
      color: #8250c8;
      :hover {
        cursor: pointer;
      }
    }
    .avatar_receiver {
      width: 24px;
      height: 24px;
    }
    .postAbove {
      display: flex;
      align-items: center;
      /* justify-content: space-between; */
      float: right;
      margin-top: 5px;
    }
    .picktime {
      width: 55 %;
    }
  }
`;

function MaterialUIPickers() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  function handleDateChange(date) {
    setSelectedDate(date);
  }

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        disableToolbar
        variant="inline"
        format="MM/dd/yyyy"
        margin="normal"
        id="date-picker-inline"
        value={selectedDate}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          "aria-label": "change date"
        }}
      />
    </MuiPickersUtilsProvider>
  );
}

class CustomPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      smt: ""
    };
  }

  async saveToIpfs(files) {
    const file = [...files][0];
    let ipfsId;
    const fileDetails = {
      path: file.name,
      content: file
    };
    const options = {
      wrapWithDirectory: true,
      progress: prog => console.log(`received: ${prog}`)
    };
    console.log("fileDetails", fileDetails);
    const resp = await ipfs.add(fileDetails, options);
    console.log("resp", resp);
  }

  captureFile = event => {
    // document.getElementById("fileInput").click();
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files;
    console.log("event.target.files", file);
    // this.saveToIpfs(event.target.files);
  };

  render() {
    const { avatarShow } = this.props;
    return (
      <Container>
        <div className="custom_post">
          <div className="tags">
            <div className="tags_tilte">
              <p>Tags: </p>
            </div>
            <div className="tagName">
              <span>#honeymoon </span>
              <span>#travel</span>
            </div>
          </div>
          <div className="postAbove">
            <div className="picktime">
              <MaterialUIPickers />
              {/* <i className="material-icons">today</i> */}
            </div>
            <div className="place-wrapper">
              <i className="material-icons">location_on</i>
            </div>
            <div className="upload_img">
              <input
                id="fileInput"
                type="file"
                className="fileInput"
                onChange={this.captureFile}
              />
              <i className="material-icons">insert_photo</i>
            </div>
            <div
              className="avatar_receiver"
              style={{ display: avatarShow === true ? "block" : "none" }}
            >
              <img src="/static/img/user-women.jpg" alt="itea" />
            </div>
          </div>
        </div>
      </Container>
    );
  }
}

CustomPost.defaultProps = {
  avatarShow: false
};

export default CustomPost;
