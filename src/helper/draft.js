// indexdb (async alternative to localStorage, can store object, not only string)
import { get as getIdb, set as setIdb, del as delIdb } from 'idb-keyval'
const BLOG_DRAFT_KEY = 'blogdraft'

export const getDraft = () => getIdb(BLOG_DRAFT_KEY).catch(console.warn)
export const setDraft = content => setIdb(BLOG_DRAFT_KEY, content).catch(console.warn)
export const delDraft = () => delIdb(BLOG_DRAFT_KEY).catch(console.error)