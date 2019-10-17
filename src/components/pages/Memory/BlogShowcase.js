import React, { useState } from 'react';
import { getPalette } from '../../../helper/palette';

export default function BlogShowcase(props) {
    const [colors, setColors] = useState(props.colors || {})
    const { classes, firstImg, firstLine, openHandler } = props
    const frameStyle = colors.frameBackColor ? { backgroundColor: colors.frameBackColor } : {}
    const labelStyle = colors.labelBackColor ? { backgroundColor: colors.labelBackColor } : {}
    return (
        <span className={classes.blogImgWrp} style={frameStyle} onClick={openHandler} >
          <span className={classes.blogTitleImg} style={labelStyle}>
            BLOG
          </span>
          <img src={firstImg} className={classes.blogImgTimeline} onLoad={() => {
            getPalette(firstImg).then(setColors)
          }} />
          {firstLine && <span className={classes.blogFirstLine}>{firstLine}</span>}
        </span>
      )
}