// We won't use the web worker yet, waiting for
// CRA support to be merged https://github.com/facebook/create-react-app/pull/7742
// import 'node-vibrant/lib/bundle.worker.js'

import { from } from 'node-vibrant'

// in the future, maybe we will cache in localStorage
const cache = {}

const processColors = rawColors => {
    const { Vibrant: vb, DarkVibrant: dvb } = rawColors
    return {
        frameBackColor: dvb.hex,
        titleColor: dvb.titleTextColor,
        labelBackColor: vb.hex,
        labelTextColor: vb.titleTextColor
    }
}

export function getPalette(img, opts) {
    const src = String(img.src || img).toLowerCase()
    const old = cache[src]

    return old ? Promise.resolve(old) : 
        from(img, opts)
        // .useQuantizer(Vibrant.Quantizer.WebWorker)
        .getPalette()
        .then(colors => {
            colors = processColors(colors)
            cache[src] = colors
            return colors
        })
        .catch(error => {
            console.error('An error occured while getting palette from image.', src, error)
            return {
                frameBackColor: '#333',
                titleColor: '#f5f5f5',
                labelBackColor: '#666',
                labelTextColor: '#f5f5f5'
            }
        })
}