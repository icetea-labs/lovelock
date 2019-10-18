import React, { useState } from 'react';
import { getPalette } from '../../../helper/palette';
import LazyLoad from 'react-lazyload';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export default function BlogShowcase(props) {
    const [colors, setColors] = useState(props.colors || {})
    const { classes, firstImg, firstLine, openHandler } = props
    const ratio =  (firstImg.aspect_ratio && firstImg.aspect_ratio.ratio) || 66.48
    const height = Math.floor(5.95 * ratio) // current image with on timeline is 595
    const frameStyle = colors.frameBackColor ? { backgroundColor: colors.frameBackColor } : {}
    const labelStyle = colors.labelBackColor ? { backgroundColor: colors.labelBackColor } : {}
    return (
        <span className={classes.blogImgWrp} style={frameStyle} onClick={openHandler} >
          <span className={classes.blogTitleImg} style={labelStyle}>
            BLOG
          </span>
          <LazyLoad height={height} offset={12} once >
          <TransitionGroup>
            <CSSTransition
              classNames='timeline-blog'
              timeout={1100}
              appear>
              <img src={firstImg.url} className={classes.blogImgTimeline} onLoad={() => {
                getPalette(firstImg.url).then(colors => colors && setColors(colors))
              }} />
            </CSSTransition>
           </TransitionGroup>
          </LazyLoad>
          {firstLine && <span className={classes.blogFirstLine}>{firstLine}</span>}
        </span>
      )
}