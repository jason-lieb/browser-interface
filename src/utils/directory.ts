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

function storeDirectoryHandle(
  directoryHandle: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('DirectoryHandle', 1)

    openRequest.onupgradeneeded = function() {
      const db = openRequest.result
      if (!db.objectStoreNames.contains('DirectoryHandle')) {
        db.createObjectStore('DirectoryHandle', {autoIncrement: true})
      }
    }

    openRequest.onsuccess = function() {
      const db = openRequest.result
      const transaction = db.transaction('DirectoryHandle', 'readwrite')
      const objectStore = transaction.objectStore('DirectoryHandle')
      const addRequest = objectStore.add(directoryHandle)

      addRequest.onsuccess = function() {
        resolve(directoryHandle)
        db.close()
      }

      addRequest.onerror = function() {
        reject(addRequest.error)
        db.close()
      }
    }

    openRequest.onerror = function() {
      reject(openRequest.error)
    }
  })
}

export function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | undefined> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('DirectoryHandle', 1)

    openRequest.onupgradeneeded = function() {
      const db = openRequest.result
      if (!db.objectStoreNames.contains('DirectoryHandle')) {
        db.createObjectStore('DirectoryHandle', {autoIncrement: true})
      }
    }

    openRequest.onsuccess = function() {
      const db = openRequest.result
      const transaction = db.transaction('DirectoryHandle', 'readonly')
      const objectStore = transaction.objectStore('DirectoryHandle')
      const getRequest = objectStore.get(1)

      getRequest.onsuccess = function() {
        resolve(getRequest.result)
        db.close()
      }

      getRequest.onerror = function() {
        reject(getRequest.error)
        db.close()
      }
    }

    openRequest.onerror = function() {
      reject(openRequest.error)
    }
  })
}
