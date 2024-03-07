import {getDirectoryHandle} from './utils/get-directory-handle'

let existingDirectoryHandle: FileSystemDirectoryHandle | undefined
;(async () => {
  existingDirectoryHandle = await getDirectoryHandle()
})()

document.querySelector('#select-directory-button')?.addEventListener('click', async () => {
  existingDirectoryHandle = await selectDirectory()
})

const input = document.querySelector('#input') as HTMLInputElement
document.querySelector('#test')?.addEventListener('click', test)

async function test() {
  console.log('input', input?.value)
  console.log(
    await chrome.tabs.query({
      currentWindow: true,
    })
  )
  console.log({existingDirectoryHandle})
  if (existingDirectoryHandle === undefined) return
  const permission = await existingDirectoryHandle.requestPermission({mode: 'readwrite'})
  console.log({permission})
  console.log(await parseDirectory(existingDirectoryHandle))
}

async function parseDirectory(directoryHandle: FileSystemDirectoryHandle) {
  const entries = directoryHandle.entries()
  const fileHandles: FileSystemFileHandle[] = []
  const directoryNames: string[] = []
  const directoryHandles: FileSystemDirectoryHandle[] = []
  for await (const entry of entries) {
    switch (entry[1].kind) {
      case 'file':
        fileHandles.push(entry[1])
        break
      case 'directory':
        directoryNames.push(entry[0])
        directoryHandles.push(await directoryHandle.getDirectoryHandle(entry[0]))
    }
  }
  return {fileHandles, directoryNames, directoryHandles}
}

async function selectDirectory(): Promise<FileSystemDirectoryHandle> {
  try {
    const directoryHandle = await window.showDirectoryPicker()
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
  } catch (error) {
    throw new Error(error as string)
  }

  // setTimeout(window.close, 100)
}

declare global {
  interface Window {
    showDirectoryPicker: () => FileSystemDirectoryHandle
  }
}

declare global {
  interface FileSystemDirectoryHandle {
    entries: () => AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>
    requestPermission: (input?: {mode: 'read' | 'readwrite'}) => string
    queryPermission: () => string
  }
}

export {}
