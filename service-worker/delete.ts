import {store} from './store'
import {catchError} from './utils/error'
import {backgroundLog} from './utils/log'

export async function deleteOpenQueueFiles() {
  const {directoryHandle, filesToDelete} = store.getState()
  if (directoryHandle === undefined) {
    chrome.alarms.clearAll()
    return
  }

  backgroundLog('Deleting open queue files: ', filesToDelete)

  for (const fileName of filesToDelete) {
    const {error} = await catchError(directoryHandle.removeEntry(fileName))
    if (error) {
      requestPermission()
      return
    }
    store.getState().removeFileToDelete(fileName)
  }
}

export async function deleteOpenQueueFile(
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string
) {
  const {removeFileToDelete} = store.getState()
  const {error} = await catchError(directoryHandle.removeEntry(fileName))
  if (error) {
    requestPermission()
    return
  }
  removeFileToDelete(fileName)
}

async function requestPermission() {
  chrome.runtime.sendMessage('Request Permission')

  const extensionUrl = chrome.runtime.getURL('browser-interface.html')
  const tabs = await chrome.tabs.query({
    url: extensionUrl,
    currentWindow: true,
  })

  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0]!.id!, {active: true})
  } else {
    await chrome.tabs.create({url: extensionUrl})
  }
}
