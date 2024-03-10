export async function selectDirectory(
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle) => void
) {
  try {
    const directoryHandle = await window.showDirectoryPicker()
    try {
      const storeDirectoryHandleLog = await storeDirectoryHandle(directoryHandle)
      console.log({storeDirectoryHandleLog})
    } catch (error) {
      throw new Error(`storeDirectoryHandle ${error}`)
    }
    setDirectoryHandle(directoryHandle)
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

function storeDirectoryHandle(directoryHandle: FileSystemDirectoryHandle) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open('DirectoryHandle', 1)

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

// type DirectoryContent = {
//   fileHandles: FileSystemFileHandle[]
//   directoryNames: string[]
//   directoryHandles: FileSystemDirectoryHandle[]
// }

// async function parseDirectory(
//   directoryHandle: FileSystemDirectoryHandle
// ): Promise<DirectoryContent> {
//   const entries = directoryHandle.entries()
//   const fileHandles: FileSystemFileHandle[] = []
//   const directoryNames: string[] = []
//   const directoryHandles: FileSystemDirectoryHandle[] = []
//   for await (const entry of entries) {
//     switch (entry[1].kind) {
//       case 'file':
//         fileHandles.push(entry[1])
//         break
//       case 'directory':
//         directoryNames.push(entry[0])
//         directoryHandles.push(await directoryHandle.getDirectoryHandle(entry[0]))
//     }
//   }
//   return {fileHandles, directoryNames, directoryHandles}
