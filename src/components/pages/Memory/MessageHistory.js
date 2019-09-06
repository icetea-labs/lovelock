import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CardActions from '@material-ui/core/CardActions';
import Skeleton from '@material-ui/lab/Skeleton';
import { TimeWithFormat } from '../../../helper';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CommentIcon from '@material-ui/icons/Comment';
import ShareIcon from '@material-ui/icons/Share';
import Tooltip from '@material-ui/core/Tooltip';
// import GridList from '@material-ui/core/GridList';
// import GridListTile from '@material-ui/core/GridListTile';

const useStyles = makeStyles(theme => ({
  card: {
    // maxWidth: 345,
    margin: theme.spacing(3, 0),
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.15)',
    // boxShadow: 'none',
    // border: '1px solid rgba(234, 236, 239, 0.7)',
  },
  media: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
    // maxHeight: 350,
    // minHeight: 150,
  },
}));
// const useStylesImg = makeStyles(theme => ({
//   root: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//     overflow: 'hidden',
//     backgroundColor: theme.palette.background.paper,
//   },
//   gridList: {
//     width: '100%',
//     height: 360,
//   },
// }));
// function ImageGridList(props) {
//   const classes = useStylesImg();
//   const { imgs } = props;
//   return (
//     <div className={classes.root}>
//       <GridList cellHeight={170} className={classes.gridList} cols={2}>
//         {imgs.map((tile, index) => (
//           <GridListTile key={index} cols={tile.cols || 1} rows={tile.rows || 1}>
//             <img src={tile.img} alt={tile.title || 'img'} />
//           </GridListTile>
//         ))}
//       </GridList>
//     </div>
//   );
// }

export default function MessageHistory(props) {
  const { loading, memoryList } = props;
  const arrayLoadin = [{}, {}, {}, {}];
  const classes = useStyles();
  // const memoryList = useSelector(state => state.loveinfo.memory);
  // if (typeof memoryList !== 'undefined' && memoryList.length > 0) {
  //   console.log('setLoading');
  // }

  if (memoryList.length <= 0) {
    if (!loading) return <div />;
    return arrayLoadin.map((item, index) => {
      return (
        <Card className={classes.card} key={index}>
          <CardHeader
            avatar={loading ? <Skeleton variant="circle" width={40} height={40} /> : ''}
            title={loading ? <Skeleton height={6} width="80%" /> : ''}
            subheader={loading ? <Skeleton height={6} width="40%" /> : ''}
          />
          <CardContent>
            {loading ? (
              <React.Fragment>
                <Skeleton height={6} />
                <Skeleton height={6} width="80%" />
              </React.Fragment>
            ) : (
              <Typography variant="body2" color="textSecondary" component="p"></Typography>
            )}
          </CardContent>
          {loading ? <Skeleton variant="rect" className={classes.media} /> : ''}
        </Card>
      );
    });
  }

  return memoryList.map(memory => {
    return (
      <Card key={memory.index} className={classes.card}>
        <CardHeader
          avatar={<Avatar alt="avata" src="/static/img/user-women.jpg" />}
          title={memory.name}
          subheader={<TimeWithFormat value={memory.info.date} format="h:mm a DD MMM YYYY" />}
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {memory.content}
          </Typography>
        </CardContent>
        <React.Fragment>
          {memory.info.hash && (
            <CardMedia className={classes.media} image={'https://ipfs.io/ipfs/' + memory.info.hash} title="img" />
          )}
          {/* <ImageGridList
              imgs={[
                { img: 'https://ipfs.io/ipfs/' + memory.info.hash, clos: 2 },
                { img: 'https://ipfs.io/ipfs/' + memory.info.hash },
                { img: 'https://ipfs.io/ipfs/' + memory.info.hash },
              ]}
            /> */}
        </React.Fragment>
        <CardActions>
          <Tooltip title="Like">
            <IconButton aria-label="add to like">
              <ThumbUpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Comment">
            <IconButton aria-label="add to message">
              <CommentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  });
}
