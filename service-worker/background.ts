import {getDirectoryHandle} from './utils/directory'
import {Tab} from './utils/format-data'

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())
chrome.runtime.onMessage.addListener(e => {
  console.log('Message to Background Script: ', e)
  init()
})

let directoryHandle: FileSystemDirectoryHandle | undefined

init()

async function init() {
  directoryHandle = await getDirectoryHandle()
  console.log({directoryHandle}) // Remove in production

  if (directoryHandle === undefined) return
  searchForOpenQueueFiles()
}

async function searchForOpenQueueFiles() {
  if (directoryHandle === undefined) return
  const fileNamePattern = new RegExp('browser-interface-open-queue-\\d+\\.json')
  const entries = directoryHandle.keys()
  for await (const entry of entries) {
    if (fileNamePattern.test(entry)) {
      handleOpenQueueFile(await directoryHandle.getFileHandle(entry))
    }
  }
  setTimeout(searchForOpenQueueFiles, 3000)
}

async function handleOpenQueueFile(handle: FileSystemFileHandle) {
  const file = await handle.getFile()
  const contents = await file.text()
  const tabs: Tab[] = JSON.parse(contents)

  try {
    await createWindowWithTabs(tabs)
    directoryHandle?.removeEntry(handle.name)
  } catch (error) {
    throw new Error(`handleOpenQueueFile: ${error}`)
  }
}

async function createWindowWithTabs(tabs: Tab[]): Promise<void> {
  try {
    const window = await chrome.windows.create({focused: true})

    await Promise.all(
      tabs.map((tab, index) => {
        chrome.tabs.create({
          windowId: window.id,
          url: tab.url,
          active: index === 0,
        })
      })
    )

    if (window.tabs === undefined || window.tabs[0].id === undefined) return
    chrome.tabs.remove(window.tabs[0].id)
  } catch (error) {
    throw new Error(`createWindowWithTabs: ${error}`)
  }
}

// async function getData(): Promise<chrome.windows.Window[] | undefined> {
//   try {
//     const rawWindows = await chrome.windows.getAll({
//       populate: true,
//       windowTypes: ['normal'],
//     })
//     return rawWindows
//   } catch (err) {
//     console.error(err)
//   }
// }

// function parseWindows(windowsResponse: chrome.windows.Window[]) {
//   windowsResponse.forEach(window => {
//     // if (window.focused) focusedWindow = window.id
//     if (window.id === undefined || window.tabs === undefined) return
//     const tabIds = getIdsFromTabs(window.tabs)
//     windows[window.id] = {tabs: tabIds}
//   })
// }

// function getIdsFromTabs(tabs: chrome.tabs.Tab[]): number[] {
//   return tabs.filter(tab => tab.id !== undefined).map(tab => tab.id)
// }

// function parseTabs(windows: chrome.windows.Window[]) {
//   windows.forEach(window => {
//     if (window.tabs === undefined) return
//     window.tabs.forEach(tab => {
//       if (tab.id === undefined) return
//       tabs[tab.id] = tab
//     })
//   })
// }

// function sendDataToFrontend() {
//   chrome.runtime.sendMessage('a' + JSON.stringify(windows))
//   chrome.runtime.sendMessage('b' + JSON.stringify(tabs))
// }

// async function handleIncomingMessages(message: string, sender: chrome.runtime.MessageSender) {
//   if (message !== 'SEND WINDOW ID') return console.log('Invalid message to backend')
//   if (sender === undefined || sender.tab === undefined) return console.log('Undefined sender')
//   chrome.runtime.sendMessage('c' + sender.tab.windowId)
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////// Potentially Useful Code

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// getDirectory Handle and selectDirectory using idb
//
// export async function getDirectoryHandle() {
//   const db = await idb.openDB('DirectoryHandle', 1, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains('directoryHandle'))
//         db.createObjectStore('directoryHandle', {autoIncrement: true})
//     },
//   })
//   const readTransaction = db.transaction('directoryHandle', 'readonly')
//   const readObjectStore = readTransaction.objectStore('directoryHandle')
//   const directoryHandle = await readObjectStore.get(1)
//   db.close()
//   return directoryHandle
// }

// async function selectDirectory() {
//   try {
//     console.log('1')
//     const directoryHandle = await window.showDirectoryPicker()
//     console.log('2')
//     const db = await idb.openDB('DirectoryHandle', 1)
//     await db.add('directoryHandle', directoryHandle)
//     db.close()
//     return directoryHandle
//   } catch (error) {
//     throw new Error(error)
//   }
// }

// // // Handle communication between background service and home tabs
// // async function handleIncomingMessages(message, sender) {
// //   const windowIdOfSender = sender.tab.windowId
// //   const [messageType, tabId, url, favIcon, ...titleSegments] =
// //     message.split(' ')
// //   const title = titleSegments.join(' ')
// //   let sleeping
// //   switch (messageType) {
// //     case 'windowID':
// //       chrome.tabs.sendMessage(
// //         sender.tab.id,
// //         String(windowIdOfSender),
// //         sendMessageCallback
// //       )
// //       break
// //     case 'sleep':
// //       sleeping = await chrome.storage.local.get('sleeping')
// //       sleeping =
// //         Object.keys(sleeping).length > 0 ? JSON.parse(sleeping['sleeping']) : []
// //       chrome.storage.local.set({
// //         [String(uniqueID)]: JSON.stringify({ title, url, favIcon }),
// //       })
// //       sleeping.push(uniqueID++)
// //       chrome.storage.local.set({ sleeping: JSON.stringify(sleeping) }, () => {
// //         let error = chrome.runtime.lastError
// //         if (error) {
// //           console.error(error)
// //         }
// //       })
// //     case 'delete':
// //       deleteTabs(+tabId)
// //       break
// //     case 'wake':
// //       chrome.tabs.create({ windowId: windowIdOfSender, url: url })
// //     case 'delete-sleeping':
// //       sleeping = await chrome.storage.local.get('sleeping')
// //       sleeping =
// //         Object.keys(sleeping).length > 0 ? JSON.parse(sleeping['sleeping']) : []
// //       sleeping = sleeping.filter((id) => id !== +tabId)
// //       chrome.storage.local.set({ sleeping: JSON.stringify(sleeping) }, () => {
// //         let error = chrome.runtime.lastError
// //         if (error) {
// //           console.error(error)
// //         }
// //       })
// //       deleteFromMemory(tabId)
// //       chrome.tabs.sendMessage(sender.tab.id, 'update', sendMessageCallback)
// //       //// send to all active tabs?
// //       break
// //     default:
// //       console.log('default case')
// //   }
// // }

// // function parseGroups(rawGroups) {
// //   rawGroups.forEach((group) => {
// //     let groupContent = {
// //       title: group.title,
// //       color: group.color,
// //       collapsed: group.collapsed,
// //     }
// //     chrome.storage.local.set(
// //       { [String(group.id)]: JSON.stringify(groupContent) },
// //       () => {
// //         let error = chrome.runtime.lastError
// //         if (error) {
// //           console.error(error)
// //         }
// //       }
// //     )
// //   })
// // }

// // async function deleteTabs(tabsToDelete: TabIdT[]) {
// //   let deletedSuccessfully = false
// //   do {
// //     try {
// //       await chrome.tabs.remove(tabsToDelete)
// //       deletedSuccessfully = true
// //     } catch (err) {
// //       await wait(500)
// //     }
// //   } while (!deletedSuccessfully)
// // }

// // function wait(x: number) {
// //   return new Promise((resolve) => setTimeout(resolve, x))
// // }

// // function sendMessageCallback() {
// //   const lastError = chrome.runtime.lastError
// //   if (
// //     lastError &&
// //     lastError.message !==
// //       'The message port closed before a response was received.'
// //   ) {
// //     console.log('Error', lastError.message)
// //   }
// // }
