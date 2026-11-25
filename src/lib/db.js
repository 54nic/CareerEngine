import { openDB } from 'idb'

const DB_NAME = 'career-engine'
const DB_VERSION = 1
export const COLLECTIONS = ['projects', 'awards', 'experiences', 'resumes', 'applications']

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
        for (const name of COLLECTIONS) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' })
          }
        }
      },
    })
  }
  return dbPromise
}

export async function loadAll() {
  const db = await getDB()
  const [profile, projects, awards, experiences, resumes, applications] = await Promise.all([
    db.get('profile', 'me'),
    db.getAll('projects'),
    db.getAll('awards'),
    db.getAll('experiences'),
    db.getAll('resumes'),
    db.getAll('applications'),
  ])
  return {
    profile: profile || null,
    projects: projects || [],
    awards: awards || [],
    experiences: experiences || [],
    resumes: resumes || [],
    applications: applications || [],
  }
}

export async function saveRecord(collection, record) {
  if (!COLLECTIONS.includes(collection)) throw new Error('未知的数据集合')
  const db = await getDB()
  await db.put(collection, JSON.parse(JSON.stringify(record)))
}

export async function deleteRecord(collection, id) {
  if (!COLLECTIONS.includes(collection)) throw new Error('未知的数据集合')
  const db = await getDB()
  await db.delete(collection, id)
}

export async function saveProfile(profile) {
  const db = await getDB()
  await db.put('profile', JSON.parse(JSON.stringify(profile)))
}

export async function clearAllData() {
  const db = await getDB()
  const tx = db.transaction([...COLLECTIONS, 'profile', 'meta'], 'readwrite')
  await Promise.all([
    ...COLLECTIONS.map((name) => tx.objectStore(name).clear()),
    tx.objectStore('profile').clear(),
    tx.objectStore('meta').clear(),
    tx.done,
  ])
}

export async function replaceAllData(data) {
  const db = await getDB()
  const tx = db.transaction([...COLLECTIONS, 'profile', 'meta'], 'readwrite')
  const tasks = []
  for (const name of COLLECTIONS) {
    const store = tx.objectStore(name)
    tasks.push(store.clear())
    for (const record of data[name] || []) {
      tasks.push(store.put(JSON.parse(JSON.stringify(record))))
    }
  }
  const profileStore = tx.objectStore('profile')
  tasks.push(profileStore.clear())
  if (data.profile) tasks.push(profileStore.put(JSON.parse(JSON.stringify(data.profile))))
  await Promise.all(tasks)
  await tx.done
}

export async function appendData(data) {
  const db = await getDB()
  const tx = db.transaction([...COLLECTIONS, 'profile'], 'readwrite')
  const tasks = []
  for (const name of COLLECTIONS) {
    for (const record of data[name] || []) tasks.push(tx.objectStore(name).put(JSON.parse(JSON.stringify(record))))
  }
  if (data.profile) tasks.push(tx.objectStore('profile').put(JSON.parse(JSON.stringify(data.profile))))
  await Promise.all(tasks)
  await tx.done
}
