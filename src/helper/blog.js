export function extractMeta(content) {
    let firstImg;
    let firstLine;

    const { blocks } = content;

    let b;
    for (b of blocks) {
        if (!firstImg) {
            if (b.type === 'image') {
                firstImg = b.data;
            } else if (b.type === 'video') {
                // get the video thumbnail
                const data = b.data && b.data.embed_data;
                if (data) {
                    firstImg = {
                        width: data.get('width'),
                        height: data.get('height'),
                        url: data.get('thumbnail_url'),
                    };
                    if (firstImg.url) {
                        firstImg.url = firstImg.url.replace('hqdefault.jpg', 'maxresdefault.jpg');
                    }
                }
            }
        }
        if (!firstLine) {
            firstLine = b.text || '';
            if (firstLine.length > 69) {
                firstLine = `${firstLine.slice(0, 69)}…`;
            }
        }
        if (firstImg && firstLine) break;
    }

    return {
        title: firstLine,
        coverPhoto: firstImg && {
            width: firstImg.width,
            height: firstImg.height,
            url: firstImg.url,
        },
    };
}

export function makeTextContent(text) {
    return {
        blocks: [
            {
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [],
                key: 'blok2',
                text,
                type: 'unstyled',
            },
        ],
        entityMap: {},
    };
}

export function combine(body, title, subtitle) {
    if (!body) {
        // generate a empty body
        body = makeTextContent('');
    }

    const h1 = title && {
        data: {},
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
        key: 'blok0',
        text: title,
        type: 'header-one',
    };

    const h3 = subtitle && {
        data: {},
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: [],
        key: 'blok1',
        text: subtitle,
        type: 'header-three',
    };

    if (!h1 && !h3) return body; // nothing to merge

    const combined = { ...body };
    combined.blocks = [...combined.blocks];
    if (h3) combined.blocks.unshift(h3);
    if (h1) combined.blocks.unshift(h1);

    return combined;
}

export function split(content) {
    const r = {
        body: null,
        title: '',
        subtitle: ''
    }

    if (!content) return r

    const blocks = content.blocks

    r.body = { ...content }
    r.body.blocks = { ...blocks }

    let count = 0

    const b0 = blocks[0]
    if (b0 && b0.key) {
        if (b0.key === 'blok0') {
            r.title = b0.text
            count++
        } else if (b0.key === 'blok1') {
            r.subtitle = b0.text
            count++
        }
    }

    const b1 = blocks[1]
    if (b1 && !r.subtitle && b1.key === 'blok1') {
        r.subtitle = b1.text
        count++
    }

    if (count) {
        r.body = { ...content }
        r.body.blocks = r.body.blocks.slice(count)
    } else {
        r.body = content
    }

    return r
}

export function validate(combined) {
    const blocks = combined.blocks
    let i;
    for (i in blocks) {
        if (blocks[i].text.trim() !== '') {
            return true;
        }
    }
    return false;
}

function hasContent(body) {
  if (!body || !body.blocks || !body.blocks.length) return false
  if (body.blocks.length > 1) return true
  const b = body.blocks[0]
  if (b.text ||
    b.type === 'image' ||
    b.type === 'video' ||
    b.type === 'embed') {
      return true
    }

  return false
}

function urlToBase64(url) {
return fetch(url)
    .then(r => r.blob())
    .then(blob => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
        resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsDataURL(blob);
    });
    });
}

function cloneForIdbSave(content) {
    return JSON.parse(JSON.stringify(content))
}

// make the content suitable for exporting/saving as draft
export async function prepareForExport(content) {
    if (!hasContent(content)) return null

    const body = cloneForIdbSave(content);
    const blocks = body.blocks;

    // we need to change image from blob:// to base64

    const images = blocks.reduce((collector, b, i) => {
        if (b.type === 'image' && b.data.url && b.data.url.indexOf('blob:') === 0) {
        collector[i] = urlToBase64(b.data.url);
        }
        return collector;
    }, {});
    if (Object.keys(images).length) {
        const base64Array = await Promise.all(Object.values(images));
        Object.keys(images).forEach((blockIndex, index) => {
        blocks[blockIndex].data.url = base64Array[index];
        });
    }

    return body
}
