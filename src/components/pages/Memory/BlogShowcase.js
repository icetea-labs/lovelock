import React, { useState } from 'react';
import { getPalette } from '../../../helper/palette';

export default function BlogShowcase(props) {
    const [colors, setColors] = useState(props.colors)
    const { classes, firstImg, firstLine } = props
    return (
        <span className={classes.blogImgWrp} style={{ backgroundColor: colors.frameBackColor }} >
          <span className={classes.blogTitleImg} style={{ backgroundColor: colors.labelBackColor }}>
            BLOG
          </span>
          <img src={firstImg} className={classes.blogImgTimeline} onLoad={() => {
            getPalette(firstImg).then(setColors)
          }} />
          {firstLine && <span className={classes.blogFirstLine}>{firstLine}</span>}
        </span>
      )
}