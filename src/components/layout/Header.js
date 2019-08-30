import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { rem, FlexBox } from '../elements/StyledUtils';
import Icon from '../elements/Icon';
import Button from '@material-ui/core/Button';
import { getTagsInfo } from '../../helper';

const Container = styled.header`
  width: 100%;
  height: ${rem(81)};
  /* background: linear-gradient(to right, #8250c8 0%, #15b5dd 50%, #8250c8 100%); */
  background: #8250c8;
  position: fixed;
  top: 0;
  left: 0;
`;
const Content = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: ${rem(960)};
  margin: 0 auto;
  color: #ffffff;
`;

const SearchBox = styled.div`
  background: #fff;
  /* height: 36px; */
  /* padding: 10px; */
  border-radius: ${rem(36)};
  margin-left: ${rem(10)};
  i {
    color: #8f8f8f;
    float: left;
    width: ${rem(36)};
    height: ${rem(36)};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  input {
    border: none;
    background: none;
    outline: none;
    float: right;
    padding: 0;
    transition: 0.4s;
    line-height: ${rem(20)};
    width: ${rem(295)};
    padding: ${rem(8)};
  }
`;
const StyledLogo = styled.a`
  font-size: ${rem(20)};
  display: flex;
  align-items: center;
  text-decoration: none;
  :hover {
    text-decoration: none;
  }
  color: inherit;
  span {
    margin: 0 ${rem(10)};
  }
  cursor: pointer;
`;
const MenuItem = styled.div`
  font-size: ${rem(14)};
  line-height: ${rem(81)};
  padding-left: ${rem(25)};
  min-width: ${rem(60)};
  cursor: pointer;
  display: flex;
  align-items: center;
  .expand {
    margin-left: ${rem(2)};
    font-weight: 600;
  }
  .username {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }
  img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: ${rem(5)};
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  i {
    font-size: ${rem(22)};
  }
  &:hover {
    color: rebeccapurple;
  }
`;
const Rectangle = styled.a`
  width: ${rem(18)};
  height: ${rem(16)};
  align-items: center;
  border-radius: 8px;
  background-color: #ff70d4;
  position: relative;
  top: -10px;
  left: -5px;
`;

class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      address: '',
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.address !== prevState.address) {
      return {
        address: nextProps.address,
      };
    } else {
      return null;
    }
  }
  componentDidMount() {
    this.loaddata();
  }

  componentDidUpdate(prevProps, prevState) {
    const { address } = this.state;
    if (address !== prevState.address) {
      this.loaddata();
    }
  }
  async loaddata() {
    const { address } = this.props;
    console.log('address', address);
    if (address === '') return;
    const reps = await getTagsInfo(address);
    // console.log('reps', reps);
    this.setState({ username: reps['display-name'] });
  }

  goRegister = () => {
    const { history } = this.props;
    history.push('/register');
  };

  goLogin = () => {
    const { history } = this.props;
    history.push('/login');
  };
  render() {
    const { username } = this.state;
    const { address } = this.props;

    return (
      <Container>
        <Content>
          <StyledLogo href="/">
            <img src="/static/img/logo.svg" alt="itea-scan" />
            <span>LoveLock</span>
          </StyledLogo>
          {address ? (
            <React.Fragment>
              <SearchBox>
                <input type="text" name="" placeholder="Search" />
                {/* <a className="search-bt">
                  <Icon type="search" />
                </a> */}
                <Icon type="search" />
              </SearchBox>
              <FlexBox flex={1} justify="flex-end">
                <MenuItem>
                  <img src="/static/img/user-men.jpg" alt="" />
                  <a className="username" href="/login">
                    {username}
                  </a>
                </MenuItem>
                <MenuItem>
                  <a href="/login">Explore</a>
                  <Icon className="expand" type="expand_more" />
                </MenuItem>
                <MenuItem>
                  <Icon type="group" />
                  <Rectangle />
                </MenuItem>
                <MenuItem>
                  <Icon type="notifications" />
                  <Rectangle />
                </MenuItem>
              </FlexBox>
            </React.Fragment>
          ) : (
            <FlexBox flex={1} justify="flex-end">
              <MenuItem>
                <Button variant="contained" color="primary" onClick={this.goLogin}>
                  Login
                </Button>
              </MenuItem>
              <MenuItem>
                <Button variant="contained" color="primary" onClick={this.goRegister}>
                  Register
                </Button>
              </MenuItem>
            </FlexBox>
          )}
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  const { account } = state;
  return {
    address: account.address,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPropose: value => {
      // dispatch(actions.setPropose(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Header));
