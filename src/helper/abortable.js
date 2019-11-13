import { useEffect } from 'react';

const makeAbortError = () => {
    return new DOMException('Operation aborted', 'AbortError')
}

const abortableFetch = (signal, convertFn) => (req, init = {}) => {
    let f = fetch(req, { ... init, signal })
    convertFn && (f = f.then(r => r[convertFn]()))

    return f
}

const abortableTimeFn = (signal, timeFn, clearTimeFn) => (fn, timeout) => {
    if (signal.aborted) return Promise.reject(makeAbortError())

    return new Promise((resolve, reject) => {
        const id = window[timeFn](() => resolve(fn()), timeout)
        signal.addEventListener('abort', e => {
            window[clearTimeFn](id)
            reject(makeAbortError())
        })
    })
}

const abortablePromise = signal => promise => {
    if (signal.aborted) return Promise.reject(makeAbortError())

    return new Promise((resolve, reject) => {
        signal.addEventListener('abort', e => {
            reject(makeAbortError())
        })
        promise.then(resolve)
    })
} 

const getAbortable = signal => {
    return {
        fetch: abortableFetch(signal),
        fetchJson: abortableFetch(signal, 'json'),
        setTimeout: abortableTimeFn(signal, 'setTimeout', 'clearTimeout'),
        setInterval: abortableTimeFn(signal, 'setInterval', 'clearInterval'),
        promise: abortablePromise(signal),

    }
}

export function useAbortableEffect(makeFn, takeFn, deps) {
    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const abortable = getAbortable(signal)

        const promise = makeFn(abortable)
        if (promise != null) {
            if (typeof promise.then !== 'function') {
                throw new Error('useAbortableEffort makeFn must return a promise.')
            }
            promise.then(data => {
                !signal.aborted && takeFn(data)
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    throw err
                }
            })
        }

        // cleanup function
        return () => {
            controller.abort()
        }

    }, deps) 
}
