import React from 'react';
import mediumZoom from 'medium-zoom';

export const zoom = mediumZoom()

// Fix the wrong image ratio if use fixed-size img with object-fit
// Future: we may fork the mediumZoom lib and tweak
zoom.on(
    'open',
    event => {
        const e = event.target
        if (!e || e.getAttribute('data-adjust') !== 'true') {
            return
        }

        e.style.objectFit = 'contain'
    }
)
zoom.on(
    'opened',
    event => {
        const e = event.target
        if (!e || e.getAttribute('data-adjust') !== 'true') {
            return
        }

        e.style.objectFit = 'cover'
    }
)

export default ({ src, alt, adjust }) => <img src={src} alt={alt} data-adjust={!!adjust} ref={zoom.attach} />
