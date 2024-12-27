import {catchError} from '../utils/error'
import {getSubDirectoryHandle} from '../utils/file-helpers'
import {backgroundLog} from '../utils/log'
import {saveAllWindows} from '../utils/save-window'
import {store} from './store'

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
