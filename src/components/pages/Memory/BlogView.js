import React, { useState, useEffect } from 'react';
import Editor from '../Memory/Editor';
import { fetchAltFirstIpfsJson } from '../../../helper/utils'

export function BlogView({ hash } = {}) {
  const [content, setContent] = useState(null)

  useEffect(() => {
    const abort = new AbortController()

    hash && fetchAltFirstIpfsJson(hash, { signal: abort.signal })
      .then(({ json }) => {
        if (!abort.signal.aborted) {
            setContent(json)
        }
    }).catch(err => {
      if (err.name === 'AbortError') return
      throw err
    })

    return () => {
        abort.abort()
    }
  }, [hash])

  return (
    <div style={{ 
        backgroundColor: '#fdfdfd',
        height: '100vh',
        paddingTop: 40
    }}>
        {content && <Editor initContent={content} read_only />}
    </div>
  );
}

export default props => BlogView({...props, hash: props.match.params.hash})