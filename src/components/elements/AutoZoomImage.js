import React from 'react';
import mediumZoom from 'medium-zoom';

export const zoom = mediumZoom()
export default ({src, alt}) => <img src={src} alt={alt} ref={zoom.attach} />
