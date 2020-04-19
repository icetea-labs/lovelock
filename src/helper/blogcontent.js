const cache = {}

export const ipfsGateway = process.env.REACT_APP_IPFS;
export const ipfsAltGateway = process.env.REACT_APP_ALT_IPFS;

export function ensureHashUrl(url, gateway = ipfsGateway) {
    gateway = ipfsGateway; // the alt gateway does not always work for image, so always use primary gateway
    return url.indexOf(':') < 0 ? gateway + url : url;
  }
  
  export function resolveBlogHashUrls(json, gateway) {
    if (!json || !json.blocks || !json.blocks.length) {
      return json;
    }
    const blocks = json.blocks;
    for (const b of blocks) {
      if (b.type === 'image' && b.data.url && b.data.url.indexOf(':') < 0) {
        b.data.url = ensureHashUrl(b.data.url, gateway);
      }
    }
    return json;
  }

export function fetchIpfsJson(hash, { gateway = ipfsGateway, signal } = {}) {
    return fetch(gateway + hash, signal ? { signal } : undefined).then(r => resolveBlogHashUrls(r.json(), gateway));
  }
  
  export function fetchJsonWithFallback(
    hash,
    mainGateway,
    fallbackGateway,
    {
      timeout = 10, // almost race
      signal,
      abortAtTimeout, // whether to abort main gateway when timeout
      abortMain, // whether to abort main gateway when resolved
      abortFallback, // whether to abort fallback gateway when resolve
    } = {}
  ) {
    if (signal && signal.aborted) {
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    }

    if (cache[hash]) {
        return Promise.resolve(cache[hash])
    }
  
    return new Promise((resolve, reject) => {
      const mainController = new AbortController();
      const secondController = signal ? new AbortController() : undefined;
  
      const timeoutId = setTimeout(() => {
        abortAtTimeout && mainController.abort();
        fetch(fallbackGateway + hash, { signal: secondController && secondController.signal })
          .then(response => response.json())
          .then(json => {
            const result = { json: resolveBlogHashUrls(json, fallbackGateway), gateway: fallbackGateway }
            if (!cache[hash]) cache[hash] = result
            resolve(result);
            abortMain && mainController.abort();
          })
          .catch(err => {
            if (err.name !== 'AbortError') {
              reject(err);
            }
          });
      }, timeout);
  
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          mainController.abort();
          secondController && secondController.abort();
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
  
      fetch(mainGateway + hash, { signal: mainController.signal })
        .then(response => {
          clearTimeout(timeoutId);
          return response.json();
        })
        .then(json => {
          const result = { json: resolveBlogHashUrls(json, mainGateway), gateway: mainGateway }
          if (!cache[hash]) cache[hash] = result
          resolve(result);
          if (abortFallback) {
            clearTimeout(timeoutId);
            secondController && secondController.abort();
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            reject(err);
          }
        });
    });
  }
  
  export function fetchMainFirstIpfsJson(hash, options = {}) {
    if (options.abortMain == null) {
      options.abortMain = true;
    }
    return fetchJsonWithFallback(hash, ipfsGateway, ipfsAltGateway, options);
  }
  
  export function fetchAltFirstIpfsJson(hash, options = {}) {
    if (options.timeout == null) {
      options.timeout = 1500; // wait a little to reduce load for our main gateway
    }
    if (options.abortFallback == null) {
      options.abortFallback = true;
    }
    return fetchJsonWithFallback(hash, ipfsAltGateway, ipfsGateway, options);
  }
  
  export function smartFetchIpfsJson(hash, options = {}) {
    let func = fetchMainFirstIpfsJson;
    if (options.timestamp && Date.now() - options.timestamp > 100000 * 60 * 1000) {
      func = fetchAltFirstIpfsJson;
    }
    return func(hash, options);
  }