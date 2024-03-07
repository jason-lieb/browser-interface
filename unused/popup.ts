// import {getDirectoryHandle} from './utils/get-directory-handle'

// init()

// async function init() {
//   const existingDirectoryHandle = await getDirectoryHandle()
//   if (existingDirectoryHandle === undefined) return chrome.runtime.openOptionsPage()

//   document.querySelector('#clear-directory-button')?.addEventListener('click', () => {
//     indexedDB.deleteDatabase('DirectoryHandle')
//     chrome.runtime.openOptionsPage()
//   })

//   const input = document.querySelector('#input') as HTMLInputElement
//   document.querySelector('#save-button')?.addEventListener('click', async () => {
//     console.log('test', input?.value)
//     console.log(await chrome.tabs.query({currentWindow: true}))
//     console.log({existingDirectoryHandle})
//     const permission = await existingDirectoryHandle.requestPermission({mode: 'readwrite'})
//     console.log({permission})
//     // console.log(await parseDirectory(existingDirectoryHandle))
//   })
// }

// // async function parseDirectory(directoryHandle: FileSystemDirectoryHandle) {
// //   const entries = directoryHandle.entries()
// //   const fileHandles: FileSystemFileHandle[] = []
// //   const directoryNames: string[] = []
// //   const directoryHandles: FileSystemDirectoryHandle[] = []
// //   for await (const entry of entries) {
// //     switch (entry[1].kind) {
// //       case 'file':
// //         fileHandles.push(entry[1])
// //         break
// //       case 'directory':
// //         directoryNames.push(entry[0])
// //         directoryHandles.push(await directoryHandle.getDirectoryHandle(entry[0]))
// //     }
// //   }
// //   return {fileHandles, directoryNames, directoryHandles}
// // }

// declare global {
//   interface FileSystemDirectoryHandle {
//     entries: () => AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>
//     requestPermission: (input?: {mode: 'read' | 'readwrite'}) => string
//     queryPermission: () => string
//   }
// }

// export {}
