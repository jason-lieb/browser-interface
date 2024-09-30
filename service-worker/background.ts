import {SHA256, enc} from 'crypto-js'
import {getDirectoryHandle} from './utils/directory'
import {saveAllWindows} from './utils/save-window'
import {Tab} from './utils/format-data'

chrome.action.onClicked.addListener(chrome.runtime.openOptionsPage)
chrome.runtime.onMessage.addListener(init)

let directoryHandle: FileSystemDirectoryHandle | undefined
let backupSubdirectory: string | undefined
const processedFiles = new Set<string>()

init()

async function init() {
  directoryHandle = await getDirectoryHandle()

  if (directoryHandle === undefined) return
  chrome.storage.local.get(['backupDirectory'], result => {
    if (result.backupDirectory) {
      backgroundLog('Backup directory found:', result.backupDirectory)
      backupSubdirectory = result.backupDirectory
      backupOpenWindows()
    } else {
      backgroundLog('Backup directory not found')
    }
  })
  searchForOpenQueueFiles()
}

function scheduleBackupOpenWindows(time: number = 15000) {
  setTimeout(backupOpenWindows, time)
}

async function backupOpenWindows() {
  if (directoryHandle === undefined || backupSubdirectory === undefined) {
    backgroundLog('Directory handle or backup subdirectory is undefined')
    scheduleBackupOpenWindows(5000)
    return
  }

  let subdirectoryHandle: FileSystemDirectoryHandle | undefined
  try {
    subdirectoryHandle = await directoryHandle.getDirectoryHandle(backupSubdirectory, {
      create: true,
    })
  } catch (err) {
    console.error('Error getting subdirectory handle: ', err)
    return
  }

  await clearSubdirectory(subdirectoryHandle)
  await saveAllWindows(subdirectoryHandle)

  scheduleBackupOpenWindows()
}

async function clearSubdirectory(subdirectoryHandle: FileSystemDirectoryHandle) {
  const entries = subdirectoryHandle.keys()
  let entryLog: string | undefined
  try {
    for await (const entry of entries) {
      entryLog = entry
      subdirectoryHandle.removeEntry(entry)
    }
  } catch (err) {
    console.error('Error clearing subdirectory entry: ', entryLog, err)
  }
}

async function searchForOpenQueueFiles() {
  if (directoryHandle === undefined) return
  const fileNamePattern = new RegExp('browser-interface-open-queue-\\d+\\.json')
  const entries = directoryHandle.keys()
  for await (const entry of entries) {
    if (fileNamePattern.test(entry)) handleOpenQueueFile(await directoryHandle.getFileHandle(entry))
  }
  setTimeout(searchForOpenQueueFiles, 3000)
}

async function handleOpenQueueFile(handle: FileSystemFileHandle) {
  const file = await handle.getFile()
  const contents = await file.text()

  const hash = SHA256(contents).toString(enc.Hex)

  if (processedFiles.has(hash)) {
    backgroundLog('Contents:', contents)
    if (directoryHandle === undefined) {
      backgroundLog('Directory handle is undefined: already processed')
      return
    }
    directoryHandle.removeEntry(handle.name)
    return
  }

  const tabs: Tab[] = JSON.parse(contents)

  try {
    processedFiles.add(hash)
    await createWindowWithTabs(tabs)
    if (directoryHandle === undefined) {
      backgroundLog('Directory handle is undefined: after creating window')
      return
    }
    directoryHandle.removeEntry(handle.name)
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

function backgroundLog(...args: unknown[]) {
  console.log(`[Background] `, ...args)
}
