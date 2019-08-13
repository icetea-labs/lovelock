import React from "react";
import styled from "styled-components";
import Icon from "src/components/elements/Icon";

const Container = styled.div`
  .custom_post {
    min-height: 55px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #e1e1e1;
    border-bottom: 1px solid #e1e1e1;
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
  }
`;

class CustomPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      smt: ""
    };
  }

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
          <div className="place-wrapper">
            <i className="material-icons">location_on</i>
          </div>
          <div className="upload_img">
            <i className="material-icons">insert_photo</i>
          </div>
          <div className="picktime">
            <i className="material-icons">today</i>
          </div>
          <div
            className="avatar_receiver"
            style={{ display: avatarShow === true ? "block" : "none" }}
          >
            <img src="/static/img/user-women.jpg" alt="itea" />
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
