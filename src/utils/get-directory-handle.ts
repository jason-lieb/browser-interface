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
