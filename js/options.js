document
  .querySelector('#select-directory-button')
  .addEventListener('click', () => selectDirectory())

async function selectDirectory() {
  try {
    const directoryHandle = await window.showDirectoryPicker()
    new Promise((resolve, reject) => {
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
  } catch (error) {
    throw new Error(error)
  }

  setTimeout(window.close, 100)
}
