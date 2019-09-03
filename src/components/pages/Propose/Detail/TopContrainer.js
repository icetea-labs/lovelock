import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';

import { FlexBox, FlexWidthBox, rem } from '../../../elements/StyledUtils';
import { TimeWithFormat } from '../../../../helper';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

const TopContainerBox = styled.div`
  .top__coverimg {
    position: relative;
    overflow: hidden;
    max-width: ${rem(900)};
    max-height: ${rem(425)};
    min-height: ${rem(225)};
    img {
      width: 100%;
      height: 100%;
    }
  }
  .top__title {
    display: flex;
    align-items: center;
    padding: ${rem(20)} 0;
    border-bottom: 1px dashed #ebebeb;
    img {
      padding-right: ${rem(15)};
    }
    .title__content {
      color: #8250c8;
      font-weight: 600;
      width: 100%;
      text-align: left;
    }
    .title__date {
      color: #8f8f8f;
    }
  }
`;
const WarrperChatBox = styled(FlexBox)`
  margin-top: ${rem(35)};
  /* & > div:first-child {
    padding-right: ${rem(15)};
  } */
  div:nth-child(even) .content_detail p {
    background-image: -webkit-linear-gradient(128deg, #ad76ff, #8dc1fe);
    background-image: linear-gradient(322deg, #ad76ff, #8dc1fe);
  }
  .proposeMes {
    display : flex;
  }
  .user_photo {
    display: block;
    img {
      width: 58px;
      height: 58px;
    }
    border-radius: 10px;
    object-fit: contain;
    overflow: hidden;
  }
  .name_time {
    .user_name {
      font-weight: 600;
      text-transform: capitalize;
      color: #8250c8;
      width: 100%;
    }
    .time {
      font-size: ${rem(12)};
      color: #8f8f8f;
    }
  }
  .content_detail {
    display: block;
    width: calc(100% - 58px - 15px);
    padding: 0 ${rem(10)};
  }
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .clearfix::after {
    display: block;
    clear: both;
    content: "";
  }
  p {
    display: block;
    padding: ${rem(11)} ${rem(14)};
    font-size: ${rem(12)};
    line-height: ${rem(18)};
    color: #ffffff;
    border-radius: 10px;
    margin-top: 10px;
    box-shadow: 0 6px 12px 0 rgba(0, 0, 0, 0.1);
    background-image: -webkit-linear-gradient(113deg, #76a8ff, #8df6fe);
    background-image: linear-gradient(337deg, #76a8ff, #8df6fe);
  }
`;

const useStyles = makeStyles({
  card: {
    width: '100%',
  },
});

export default function TopContrainer(props) {
  let loading = true;
  const propose = useSelector(state => state.loveinfo.propose);
  if (typeof propose !== 'undefined' && propose.length > 0) loading = false;

  const { proIndex } = props;
  const topInfo = propose.filter(item => item.id === proIndex)[0] || [];
  const classes = useStyles();

  return (
    <TopContainerBox>
      <div className="top__coverimg">
        {topInfo.coverimg ? (
          <img src={'https://ipfs.io/ipfs/' + topInfo.coverimg} alt="itea-scan" />
        ) : loading ? (
          <Skeleton variant="rect" width="100%" height={118} />
        ) : (
          ''
        )}
      </div>

      <WarrperChatBox>
        {topInfo.s_content ? (
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="user_photo fl">
              <img src="/static/img/user-men.jpg" alt="itea" />
            </div>
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">{topInfo.s_name}</span>
                <span className="time fr color-gray">
                  <TimeWithFormat value={topInfo.s_date} />
                </span>
              </div>
              <p>{topInfo.s_content}</p>
            </div>
          </FlexWidthBox>
        ) : (
          <FlexWidthBox width="50%" className="proposeMes">
            <CardHeader
              className={classes.card}
              avatar={loading ? <Skeleton variant="circle" width={40} height={40} /> : ''}
              title={loading ? <Skeleton height={6} width="80%" /> : ''}
              subheader={loading ? <Skeleton height={12} width="80%" /> : ''}
            />
          </FlexWidthBox>
        )}
        {topInfo.r_content ? (
          <FlexWidthBox width="50%" className="proposeMes">
            <div className="content_detail fl clearfix">
              <div className="name_time">
                <span className="user_name color-violet">{topInfo.r_name}</span>
                <span className="time fr color-gray">
                  <TimeWithFormat value={topInfo.r_date} />
                </span>
              </div>
              <p>{topInfo.r_content}</p>
            </div>
            <div className="user_photo fr">
              <img src="/static/img/user-women.jpg" alt="itea" />
            </div>
          </FlexWidthBox>
        ) : (
          <FlexWidthBox width="50%" className="proposeMes">
            <CardHeader
              className={classes.card}
              avatar={loading ? <Skeleton variant="circle" width={40} height={40} /> : ''}
              title={loading ? <Skeleton height={6} width="80%" /> : ''}
              subheader={loading ? <Skeleton height={12} width="80%" /> : ''}
            />
          </FlexWidthBox>
        )}
      </WarrperChatBox>
    </TopContainerBox>
  );
}

// const mapStateToProps = state => {
//   const { loveinfo } = state;
//   return {
//     propose: loveinfo.propose,
//   };
// };

// const mapDispatchToProps = dispatch => {
//   return {
//     setPropose: value => {
//       dispatch(actions.setPropose(value));
//     },
//     setLoading: value => {
//       // dispatch(actions.setLoading(value));
//     },
//   };
// };

// export default withRouter(
//   connect(
//     mapStateToProps,
//     mapDispatchToProps
//   )(TopContrainer)
// );
