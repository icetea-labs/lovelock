// indexdb (async alternative to localStorage, can store object, not only string)
import { get as getIdb, set as setIdb, del as delIdb, keys as allIdb } from 'idb-keyval'

export const loadDraft = key => getIdb(key).catch(console.warn)
export const saveDraft = (key, content) => setIdb(key, content).catch(console.warn)
export const delDraft = key => delIdb(key).catch(console.error)
export const loadAllDrafts = async () => {
    const keys = (await allIdb()).filter(k => k.startsWith('draft_'))
    const promises = keys.reduce((col, k) => {
        col.push(loadDraft(k))
        return col
    }, [])
    const values = await Promise.all(promises)
    return values.map((v, i) => ({ key: keys[i], ...v }))
}