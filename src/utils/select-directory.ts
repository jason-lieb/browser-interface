export async function selectDirectory(
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle) => void
) {
  try {
    const directoryHandle = await window.showDirectoryPicker()
    // Handle errors for indexedDB differently?
    const newDirectoryHandle = (await new Promise((resolve, reject) => {
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
    })) as FileSystemDirectoryHandle

    setDirectoryHandle(newDirectoryHandle)
  } catch (error) {
    throw new Error(error as string)
  }
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
