import {getDirectoryHandle} from './utils/directory'
import {Tab} from './utils/format-data'

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())
chrome.runtime.onMessage.addListener(() => init())

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
