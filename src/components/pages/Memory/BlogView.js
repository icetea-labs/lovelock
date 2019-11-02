import React, { useState, useEffect } from 'react';
import Editor from '../Memory/Editor';

const PATH = process.env.REACT_APP_ALT_IPFS || process.env.REACT_APP_IPFS

export function BlogView({ hash } = {}) {
  const [content, setContent] = useState(null)

  useEffect(() => {
    let cancel = false
    const abort = new AbortController()

    hash && fetch(PATH + hash, { signal: abort.signal }).then(r => r.json()).then(json => {
        if (!cancel) {
            setContent(json)
        }
    }).catch(console.warn)

    return () => {
        abort.abort()
        cancel = true
    }
  }, [hash])

  return (
    <div style={{ 
        backgroundColor: '#fdfdfd',
        marginTop: -40,
        paddingTop: 40,
        paddingBottom: 40
    }}>
        {content && <Editor initContent={content} read_only />}
    </div>
  );
}

export default props => BlogView({...props, hash: props.match.params.hash})