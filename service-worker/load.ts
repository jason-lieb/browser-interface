import {Alarms} from './alarms'
import {store} from './store'
import {catchError} from './utils/error'
import {getDirectoryHandle} from './utils/indexed-db'
import {backgroundLog} from './utils/log'

export async function loadDirectoryHandle() {
  const {data: directoryHandle, error: directoryHandleError} =
    await catchError(getDirectoryHandle())
  if (directoryHandleError) {
    store.getState().setDirectoryHandle(undefined)
    throw new Error(`Error getting directory handle: ${directoryHandleError}`)
  }
  store.getState().setDirectoryHandle(directoryHandle)
}

export async function loadBackupSubDirectory() {
  await chrome.alarms.clear(Alarms.BackupOpenWindows)

  const {data: result, error: backupDirectoryError} = await catchError(
    chrome.storage.local.get('backupDirectory')
  )
  if (backupDirectoryError) {
    backgroundLog('Error getting backup directory:', backupDirectoryError)
    return
  }

  if (result.backupDirectory && result.backupDirectory !== '') {
    backgroundLog('Backup subdirectory found:', result.backupDirectory)
    store.getState().setBackupSubdirectory(result.backupDirectory)

    chrome.alarms.create(Alarms.BackupOpenWindows, {
      delayInMinutes: 0,
      periodInMinutes: 5,
    })
  } else {
    store.getState().setBackupSubdirectory(undefined)
  }
}
