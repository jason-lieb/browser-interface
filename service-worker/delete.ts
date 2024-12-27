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
      chrome.runtime.sendMessage('Request Permission')
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
    chrome.runtime.sendMessage('Request Permission')
    return
  }
  removeFileToDelete(fileName)
}
