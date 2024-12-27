import {catchError} from './error'
import {storeDirectoryHandle} from './indexed-db'

export async function selectDirectory(
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle) => void
) {
  const {data: directoryHandle, error} = await catchError(window.showDirectoryPicker())
  if (error) throw new Error(`window.showDirectoryPicker: ${error}`)

  const {data: storedDirectoryHandle, error: storeDirectoryHandleError} = await catchError(
    storeDirectoryHandle(directoryHandle)
  )
  if (storeDirectoryHandleError)
    throw new Error(`storeDirectoryHandle: ${storeDirectoryHandleError}`)

  chrome.runtime.sendMessage('Changed Directory Handle')
  setDirectoryHandle(storedDirectoryHandle)
}

export function clearDirectory(
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle | undefined) => void
) {
  indexedDB.deleteDatabase('DirectoryHandle')
  setDirectoryHandle(undefined)
  chrome.runtime.sendMessage('Changed Directory Handle')
}
