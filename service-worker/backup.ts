import {store} from './store'
import {catchError} from './utils/error'
import {getSubDirectoryHandle} from './utils/file-helpers'
import {backgroundLog} from './utils/log'
import {saveAllWindows} from './utils/save-window'

export async function backupOpenWindows() {
  const {directoryHandle, backupSubdirectory} = store.getState()
  if (directoryHandle === undefined || backupSubdirectory === undefined) {
    chrome.alarms.clearAll()
    return
  }

  const {data: subdirectoryHandle, error: subdirectoryHandleError} = await catchError(
    getSubDirectoryHandle(directoryHandle, backupSubdirectory.split('/'))
  )
  if (subdirectoryHandleError)
    throw new Error(`Error getting subdirectory handle: ${subdirectoryHandleError}`)

  const hasTabsToBackup = await checkForTabsToBackup()
  if (!hasTabsToBackup) return

  backgroundLog('Clearing directory and backing up open windows')
  await clearSubdirectory(subdirectoryHandle)
  await saveAllWindows(subdirectoryHandle)
  await createLastBackupTimestamp(subdirectoryHandle)
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

async function createLastBackupTimestamp(subdirectoryHandle: FileSystemDirectoryHandle) {
  const timestamp = new Date()
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+),\s/, '$3-$1-$2 ')

  const {data: fileHandle, error: fileHandleError} = await catchError(
    subdirectoryHandle.getFileHandle('lastBackupTimestamp.txt', {
      create: true,
    })
  )
  if (fileHandleError) throw new Error(`Error getting file handle: ${fileHandleError}`)

  const {data: writable, error: writableError} = await catchError(fileHandle.createWritable())
  if (writableError) throw new Error(`Error creating writable: ${writableError}`)

  const {error: writeError} = await catchError(writable.write(timestamp))
  if (writeError) throw new Error(`Error writing to file: ${writeError}`)

  const {error: closeError} = await catchError(writable.close())
  if (closeError) throw new Error(`Error closing file: ${closeError}`)
}
