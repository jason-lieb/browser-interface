import {persist, createJSONStorage, StateStorage} from 'zustand/middleware'
import {createStore} from 'zustand/vanilla'
import {SHA256, enc} from 'crypto-js'
import {catchError} from './utils/catch-error'
import {createWindowWithTabs} from './utils/create-window'
import {getSubDirectoryHandle} from './utils/file-helpers'
import {TabT} from './utils/format-tabs'
import {getDirectoryHandle} from './utils/indexed-db'
import {backgroundLog} from './utils/log'
import {saveAllWindows} from './utils/save-window'

type Store = {
  directoryHandle: FileSystemDirectoryHandle | undefined
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | undefined) => void

  backupSubdirectory: string | undefined
  setBackupSubdirectory: (path: string | undefined) => void

  processedFiles: Set<string>
  addProcessedFile: (file: string) => void
  removeProcessedFile: (file: string) => void

  filesToDelete: Set<string>
  addFileToDelete: (file: string) => void
  removeFileToDelete: (file: string) => void
}

export const store = createStore<Store, [['zustand/persist', unknown]]>(
  persist(
    set => ({
      directoryHandle: undefined,
      setDirectoryHandle: (handle: FileSystemDirectoryHandle | undefined) =>
        set({directoryHandle: handle}),

      backupSubdirectory: undefined,
      setBackupSubdirectory: (path: string | undefined) => set({backupSubdirectory: path}),

      processedFiles: new Set<string>(),
      addProcessedFile: (file: string) =>
        set(state => ({
          processedFiles: new Set([...state.processedFiles, file]),
        })),
      removeProcessedFile: (file: string) =>
        set(state => ({
          processedFiles: new Set([...state.processedFiles].filter(f => f !== file)),
        })),

      filesToDelete: new Set<string>(),
      addFileToDelete: (file: string) =>
        set(state => ({
          filesToDelete: new Set([...state.filesToDelete, file]),
        })),
      removeFileToDelete: (file: string) =>
        set(state => ({
          filesToDelete: new Set([...state.filesToDelete].filter(f => f !== file)),
        })),
    }),
    {
      name: 'service-worker-storage',
      storage: createJSONStorage(() => storage),
      partialize: state => ({
        backupSubdirectory: state.backupSubdirectory,
        processedFiles: state.processedFiles,
        filesToDelete: state.filesToDelete,
      }),
    }
  )
)

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = await chrome.storage.local.get(name)
    return result[name] || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await chrome.storage.local.set({[name]: value})
  },
  removeItem: async (name: string): Promise<void> => {
    await chrome.storage.local.remove(name)
  },
}

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())

chrome.runtime.onMessage.addListener(message => {
  switch (message) {
    case 'New Directory Handle':
      init()
      break
    case 'Changed Backup Directory':
      loadBackupSubDirectory()
      break
    case 'Manually Run Backup':
      backupOpenWindows()
    case 'Request Permission':
      break
    default:
      backgroundLog('Unexpected message: ', message)
  }
})

const DEFAULT_BACKUP_FREQUENCY = 5 * 60 * 1000

init()
setInterval(backupOpenWindows, DEFAULT_BACKUP_FREQUENCY)

async function init() {
  const {data: directoryHandle, error: directoryHandleError} =
    await catchError(getDirectoryHandle())
  if (directoryHandleError)
    throw new Error(`Error getting directory handle: ${directoryHandleError}`)

  store.getState().setDirectoryHandle(directoryHandle)
  if (directoryHandle === undefined) return

  loadBackupSubDirectory()
  searchForOpenQueueFiles()
  deleteOpenQueueFiles()
}

function loadBackupSubDirectory() {
  chrome.storage.local.get(['backupDirectory'], result => {
    if (result.backupDirectory) {
      backgroundLog('Backup subdirectory found:', result.backupDirectory)
      store.getState().setBackupSubdirectory(result.backupDirectory)
      backupOpenWindows()
    } else {
      backgroundLog('Backup subdirectory not found')
      store.getState().setBackupSubdirectory(undefined)
    }
  })
}

async function backupOpenWindows() {
  const {directoryHandle, backupSubdirectory} = store.getState()

  if (directoryHandle === undefined) {
    backgroundLog('Cannot backup windows: directory handle is undefined')
    return
  }
  if (backupSubdirectory === undefined) {
    backgroundLog('Cannot backup windows: backup subdirectory is undefined')
    return
  }
  if (backupSubdirectory === '') {
    backgroundLog('Cannot backup windows: backup subdirectory is an empty string')
    return
  }

  const {data: subdirectoryHandle, error: subdirectoryHandleError} = await catchError(
    getSubDirectoryHandle(directoryHandle, backupSubdirectory.split('/'))
  )
  if (subdirectoryHandleError)
    throw new Error('Error getting subdirectory handle: ', subdirectoryHandleError)

  const hasTabsToBackup = await checkForTabsToBackup()
  if (!hasTabsToBackup) {
    backgroundLog('No tabs to backup')
    return
  }
  backgroundLog('Clearing directory and backing up open windows')
  await clearSubdirectory(subdirectoryHandle)
  await saveAllWindows(subdirectoryHandle)
}

async function clearSubdirectory(subdirectoryHandle: FileSystemDirectoryHandle) {
  let entryLog: string | undefined
  try {
    for await (const entry of subdirectoryHandle.keys()) {
      entryLog = entry
      subdirectoryHandle.removeEntry(entry)
    }
  } catch (err) {
    console.error('Error clearing subdirectory entry: ', entryLog, err)
  }
}

async function checkForTabsToBackup() {
  const {data: allTabs, error: allTabsError} = await catchError(chrome.tabs.query({}))
  if (allTabsError) throw new Error(`Error getting all tabs: ${allTabsError}`)
  const tabs = allTabs.filter(
    tab => tab.url?.split('://')[0] !== 'chrome' && tab.url?.split('://')[0] !== 'chrome-extension'
  )
  return tabs.length > 0
}

async function searchForOpenQueueFiles() {
  const {directoryHandle} = store.getState()
  if (directoryHandle === undefined) return
  const fileNamePattern = new RegExp('browser-interface-open-queue-\\d+\\.json')
  backgroundLog('Searching for open queue files')
  for await (const entry of directoryHandle.keys()) {
    if (fileNamePattern.test(entry)) {
      backgroundLog('Found open queue file: ', entry)
      const {data: fileHandle, error} = await catchError(directoryHandle.getFileHandle(entry))
      if (error) {
        console.error('Error getting file handle for ', entry, ': ', error)
        continue
      }

      const {error: handleOpenQueueFileError} = await catchError(handleOpenQueueFile(fileHandle))
      if (handleOpenQueueFileError) {
        console.error('Error handling open queue file: ', entry, ': ', handleOpenQueueFileError)
        continue
      }
    }
  }
  setTimeout(searchForOpenQueueFiles, 3 * 60 * 1000)
}

async function deleteOpenQueueFiles() {
  const {directoryHandle, filesToDelete} = store.getState()
  if (directoryHandle === undefined) return
  backgroundLog('Deleting open queue files: ', filesToDelete)

  for (const fileName of filesToDelete) {
    const {error} = await catchError(directoryHandle.removeEntry(fileName))
    if (error) {
      chrome.runtime.sendMessage('Request Permission')
      continue
    }
    store.getState().removeFileToDelete(fileName)
  }
  setTimeout(deleteOpenQueueFiles, 3 * 60 * 1000)
}

async function handleOpenQueueFile(handle: FileSystemFileHandle) {
  const {directoryHandle, processedFiles} = store.getState()
  const {data: file, error: fileError} = await catchError(handle.getFile())
  if (fileError) throw new Error(`Error getting file: ${fileError}`)

  const {data: contents, error: contentsError} = await catchError(file.text())
  if (contentsError) throw new Error(`Error getting file contents: ${contentsError}`)

  const hash = SHA256(contents).toString(enc.Hex)

  if (processedFiles.has(hash)) {
    if (directoryHandle === undefined) {
      backgroundLog('Directory handle is undefined: already processed')
      return
    }
    deleteOpenQueueFile(directoryHandle, handle.name)
    return
  }

  const tabs: TabT[] = JSON.parse(contents)

  processedFiles.add(hash)
  const {error} = await catchError(createWindowWithTabs(tabs))
  if (error) console.error('Error creating window with tabs: ', error)
  if (directoryHandle === undefined) {
    backgroundLog('Directory handle is undefined: after creating window')
    return
  }
  deleteOpenQueueFile(directoryHandle, handle.name)
}

async function deleteOpenQueueFile(direcotoryHandle: FileSystemDirectoryHandle, fileName: string) {
  const {addFileToDelete, removeFileToDelete} = store.getState()
  addFileToDelete(fileName)
  const {error} = await catchError(direcotoryHandle.removeEntry(fileName))
  if (error) {
    chrome.runtime.sendMessage('Request Permission')
    return
  }
  removeFileToDelete(fileName)
}
