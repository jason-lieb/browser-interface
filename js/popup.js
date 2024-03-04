import {getDirectoryHandle} from './utils/get-directory-handle'

init()

async function init() {
  document.querySelector('#clear-directory-button').addEventListener('click', () => {
    indexedDB.deleteDatabase('DirectoryHandle')
    chrome.runtime.openOptionsPage()
  })

  const existingDirectoryHandle = await getDirectoryHandle()

  if (existingDirectoryHandle === undefined) {
    chrome.runtime.openOptionsPage()
  } else {
  }
}
