import {deleteOpenQueueFile} from './delete'
import {store} from './store'
import {createWindowWithTabs} from './utils/create-window'
import {catchError} from './utils/error'
import {TabT} from './utils/format-tabs'
import {backgroundLog} from './utils/log'

export async function searchForOpenQueueFiles() {
  const {directoryHandle} = store.getState()
  if (directoryHandle === undefined) {
    chrome.alarms.clearAll()
    return
  }

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
}

async function handleOpenQueueFile(handle: FileSystemFileHandle) {
  const {directoryHandle, filesToDelete, addFileToDelete} = store.getState()
  if (directoryHandle === undefined) throw new Error('Impossible')

  const {data: file, error: fileError} = await catchError(handle.getFile())
  if (fileError) throw new Error(`Error getting file: ${fileError}`)

  const {data: contents, error: contentsError} = await catchError(file.text())
  if (contentsError) throw new Error(`Error getting file contents: ${contentsError}`)

  if (filesToDelete.has(handle.name)) {
    deleteOpenQueueFile(directoryHandle, handle.name)
    return
  }

  const tabs: TabT[] = JSON.parse(contents)

  const {error} = await catchError(createWindowWithTabs(tabs))
  if (error) console.error('Error creating window with tabs: ', error)

  addFileToDelete(handle.name)
  deleteOpenQueueFile(directoryHandle, handle.name)
}
