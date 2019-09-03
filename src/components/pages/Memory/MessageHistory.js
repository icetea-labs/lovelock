import React from 'react';
import { useSelector } from 'react-redux';
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
import MessageIcon from '@material-ui/icons/Message';
import ShareIcon from '@material-ui/icons/Share';
import Tooltip from '@material-ui/core/Tooltip';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

const useStyles = makeStyles(theme => ({
  card: {
    // maxWidth: 345,
    margin: theme.spacing(2),
  },
  media: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
    // maxHeight: 350,
    // minHeight: 150,
  },
}));
const useStylesImg = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: '100%',
    height: 360,
  },
}));
function ImageGridList(props) {
  const classes = useStylesImg();
  const { imgs } = props;
  return (
    <div className={classes.root}>
      <GridList cellHeight={170} className={classes.gridList} cols={2}>
        {imgs.map((tile, index) => (
          <GridListTile key={index} cols={tile.cols || 1} rows={tile.rows || 1}>
            <img src={tile.img} alt={tile.title || 'img'} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

export default function MessageHistory(props) {
  let loading = true;
  const classes = useStyles();
  const memoryList = useSelector(state => state.loveinfo.memory);
  if (typeof memoryList !== 'undefined' && memoryList.length > 0) loading = false;

  return memoryList.map(memory => {
    return (
      <Card key={memory.index} className={classes.card}>
        <CardHeader
          avatar={
            loading ? (
              <Skeleton variant="circle" width={40} height={40} />
            ) : (
              <Avatar alt="avata" src="/static/img/user-women.jpg" />
            )
          }
          title={loading ? <Skeleton height={6} width="80%" /> : memory.name}
          subheader={
            loading ? (
              <Skeleton height={6} width="40%" />
            ) : (
              <TimeWithFormat value={memory.info.date} format="h:mm a DD MMM YYYY" />
            )
          }
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>
          {loading ? (
            <React.Fragment>
              <Skeleton height={6} />
              <Skeleton height={6} width="80%" />
            </React.Fragment>
          ) : (
            <Typography variant="body2" color="textSecondary" component="p">
              {memory.content}
            </Typography>
          )}
        </CardContent>
        {loading ? (
          <Skeleton variant="rect" className={classes.media} />
        ) : (
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
        )}
        <CardActions>
          <Tooltip title="Like">
            <IconButton aria-label="add to like">
              <ThumbUpIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Comment">
            <IconButton aria-label="add to message">
              <MessageIcon />
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
