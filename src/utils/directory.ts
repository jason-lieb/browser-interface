import {storeDirectoryHandle} from './indexed-db'

export async function selectDirectory(
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle) => void
) {
  try {
    const directoryHandle = await window.showDirectoryPicker()
    try {
      const storedDirectoryHandle = await storeDirectoryHandle(directoryHandle)
      chrome.runtime.sendMessage('New Directory Handle')
      setDirectoryHandle(storedDirectoryHandle)
    } catch (error) {
      throw new Error(`storeDirectoryHandle ${error}`)
    }
  } catch (error) {
    throw new Error(`window.showDirectoryPicker ${error}`)
  }
}

export function clearDirectory(
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle | undefined) => void
) {
  indexedDB.deleteDatabase('DirectoryHandle')
  setDirectoryHandle(undefined)
}
