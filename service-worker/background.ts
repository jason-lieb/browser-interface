import {backupOpenWindows} from './src/backup'
import {deleteOpenQueueFiles} from './src/delete'
import {searchForOpenQueueFiles} from './src/open'
import {store} from './src/store'
import {catchError} from './utils/error'
import {getDirectoryHandle} from './utils/indexed-db'
import {backgroundLog} from './utils/log'

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())

const Alarms = {
  BackupOpenWindows: 'backupOpenWindows',
  SearchForOpenQueueFiles: 'searchForOpenQueueFiles',
  DeleteOpenQueueFiles: 'deleteOpenQueueFiles',
} as const

chrome.alarms.onAlarm.addListener(alarm => {
  switch (alarm.name) {
    case Alarms.BackupOpenWindows:
      backupOpenWindows()
      break
    case Alarms.SearchForOpenQueueFiles:
      searchForOpenQueueFiles()
      break
    case Alarms.DeleteOpenQueueFiles:
      deleteOpenQueueFiles()
      break
    default:
      backgroundLog('Unexpected alarm: ', alarm.name)
  }
})

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

init()

async function init() {
  await chrome.alarms.clearAll()
  await loadDirectoryHandle()
  if (store.getState().directoryHandle === undefined) return

  loadBackupSubDirectory()

  chrome.alarms.create(Alarms.BackupOpenWindows, {
    delayInMinutes: 1,
    periodInMinutes: 5,
  })

  chrome.alarms.create(Alarms.SearchForOpenQueueFiles, {
    delayInMinutes: 0,
    periodInMinutes: 3,
  })

  chrome.alarms.create(Alarms.DeleteOpenQueueFiles, {
    delayInMinutes: 1,
    periodInMinutes: 3,
  })
}

async function loadDirectoryHandle() {
  const {data: directoryHandle, error: directoryHandleError} =
    await catchError(getDirectoryHandle())
  if (directoryHandleError) {
    store.getState().setDirectoryHandle(undefined)
    throw new Error(`Error getting directory handle: ${directoryHandleError}`)
  }
  store.getState().setDirectoryHandle(directoryHandle)
}

function loadBackupSubDirectory() {
  chrome.storage.local.get(['backupDirectory'], result => {
    if (result.backupDirectory) {
      backgroundLog('Backup subdirectory found:', result.backupDirectory)
      store.getState().setBackupSubdirectory(result.backupDirectory)
      backupOpenWindows()
    } else {
      store.getState().setBackupSubdirectory(undefined)
    }
  })
}
