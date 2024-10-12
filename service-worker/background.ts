import {SHA256, enc} from 'crypto-js'
import {getDirectoryHandle} from './utils/directory'
import {saveAllWindows, getSubDirectoryHandle} from './utils/save-window'
import {Tab} from './utils/format-data'
import {createWindowWithTabs} from './utils/create-window'

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())
chrome.runtime.onMessage.addListener(message => {
  switch (message) {
    case 'New Directory Handle':
      init()
      break
    case 'Changed Backup Directory':
      loadBackupDirectory()
      break
    case 'Manually Run Backup':
      backupOpenWindows()
      break
    default:
      backgroundLog('Unexpected message: ', message)
  }
})

let directoryHandle: FileSystemDirectoryHandle | undefined
let backupSubdirectory: string | undefined
const processedFiles = new Set<string>()

const DEFAULT_BACKUP_FREQUENCY = 5 * 60 * 1000

init()
setInterval(backupOpenWindows, DEFAULT_BACKUP_FREQUENCY)

async function init() {
  directoryHandle = await getDirectoryHandle()
  if (directoryHandle === undefined) return
  loadBackupDirectory()
  searchForOpenQueueFiles()
}

function loadBackupDirectory() {
  chrome.storage.local.get(['backupDirectory'], result => {
    if (result.backupDirectory) {
      backgroundLog('Backup directory found:', result.backupDirectory)
      backupSubdirectory = result.backupDirectory
      backupOpenWindows()
    } else {
      backgroundLog('Backup directory not found')
      backupSubdirectory = undefined
    }
  })
}

async function backupOpenWindows() {
  if (directoryHandle === undefined) {
    backgroundLog('Directory handle is undefined')
    return
  }
  if (backupSubdirectory === undefined) {
    backgroundLog('Backup subdirectory is undefined')
    return
  }
  if (backupSubdirectory === '') {
    backgroundLog("Directory handle or backup subdirectory is ''")
    return
  }

  let subdirectoryHandle: FileSystemDirectoryHandle | undefined
  try {
    subdirectoryHandle = await getSubDirectoryHandle(directoryHandle, backupSubdirectory.split('/'))
  } catch (err) {
    console.error('Error getting subdirectory handle: ', err)
  }

  if (subdirectoryHandle === undefined) return
  backgroundLog('Clearing directory and backing up open windows')
  await clearSubdirectory(subdirectoryHandle)
  await saveAllWindows(subdirectoryHandle)
}

async function clearSubdirectory(subdirectoryHandle: FileSystemDirectoryHandle) {
  let entryLog: string | undefined
  try {
    for await (const entry of subdirectoryHandle.keys()) {
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
  for await (const entry of directoryHandle.keys()) {
    if (fileNamePattern.test(entry)) handleOpenQueueFile(await directoryHandle.getFileHandle(entry))
  }
  setTimeout(searchForOpenQueueFiles, 3 * 60 * 1000)
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

function backgroundLog(...args: unknown[]) {
  console.log(`[Background] `, ...args)
}
