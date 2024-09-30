import {SHA256, enc} from 'crypto-js'
import {getDirectoryHandle} from './utils/directory'
import {Tab} from './utils/format-data'

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())
chrome.runtime.onMessage.addListener(() => init())

let directoryHandle: FileSystemDirectoryHandle | undefined
const processedFiles = new Set<string>()

init()

async function init() {
  directoryHandle = await getDirectoryHandle()

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

  const hash = SHA256(contents).toString(enc.Hex)

  if (processedFiles.has(hash)) {
    return
  }

  const tabs: Tab[] = JSON.parse(contents)

  try {
    console.log('Adding hash:', hash)
    processedFiles.add(hash)
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

    console.log('Window created')
    if (window.tabs === undefined || window.tabs[0].id === undefined) return
    console.log('Removing first tab')
    chrome.tabs.remove(window.tabs[0].id)
  } catch (error) {
    throw new Error(`createWindowWithTabs: ${error}`)
  }
}
