// import {getDirectoryHandle} from './utils/background/get-directory-handle'

// init()

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})

// async function init() {
//   const existingDirectoryHandle = await getDirectoryHandle()
//   if (existingDirectoryHandle === undefined) {
//     chrome.runtime.openOptionsPage()
//   } else {
//   }
// }

// chrome.runtime.onMessage.addListener(handleIncomingMessages)
// chrome.runtime.onInstalled.addListener(createTab)
// chrome.action.onClicked.addListener(createTab)

// function createTab() {
//   chrome.tabs.create({ url: './index.html' })
// }

// init()

// function init() {
//   fetchAndParseData()
//   setTimeout(sendDataToFrontend, 500)
// }

// async function fetchAndParseData() {
//   const windowsResponse = await getData()
//   if (windowsResponse === undefined) return
//   parseWindows(windowsResponse)
//   parseTabs(windowsResponse)
//   // console.log('windows', windows)
//   // console.log('tabs', tabs)
// }

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

// Data Structures (Only neccesary data)
// // Map<"windowID": { groupsIDs: [GroupId], tabIDs: [TabId]}>
// // Map<"tabID": { title: String, url: String, favIcon: String, groupID: Int }>
// // Map<"groupID": { title: String, color: String, collapsed: Bool } }>

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
