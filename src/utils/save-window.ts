import {clearDirectory} from './directory'
import {fileExists, getSubDirectoryHandle} from './file-helpers'
import {formatTabs} from './format-tabs'
import {jsonToMarkdown} from './markdown'

export async function saveWindow(
  directoryHandle: FileSystemDirectoryHandle,
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle | undefined) => void,
  inputText: string
) {
  const trimmedInputText = inputText.trim()
  if (trimmedInputText === '' || trimmedInputText[0] === '/')
    return alert('Please enter a file path')

  try {
    const window = await chrome.windows.getCurrent({populate: true})
    if (window.id === undefined || window.tabs === undefined) return
    const tabs = formatTabs(window.tabs)
    const {headers, content} = jsonToMarkdown(tabs)

    const formattedInputText = trimmedInputText
      .split('/')
      .map(s => s.trim())
      .filter(s => s !== '')
    const fileName = formattedInputText.pop()
    if (fileName === undefined) return

    const subDirectoryHandle = await getSubDirectoryHandle(directoryHandle, formattedInputText)
    const fileAlreadyExists = await fileExists(subDirectoryHandle, `${fileName}.md`)

    if (fileAlreadyExists) {
      const file = await fileAlreadyExists.getFile()
      const reader = new FileReader()
      reader.readAsText(file)
      await new Promise(resolve => (reader.onloadend = resolve))
      const existingContent = reader.result

      const writable = await fileAlreadyExists.createWritable()
      await writable.write(existingContent + content)
      await writable.close()

      chrome.windows.remove(window.id)
    } else {
      const fileHandle = await subDirectoryHandle.getFileHandle(`${fileName}.md`, {
        create: true,
      })

      const writable = await fileHandle.createWritable()
      await writable.write(headers + content)
      await writable.close()

      chrome.windows.remove(window.id)
    }
  } catch (err) {
    console.log('Error saving window, clearing directory...')
    clearDirectory(setDirectoryHandle)
    console.error(err)
  }
}

export async function saveAllWindows(subDirectoryHandle: FileSystemDirectoryHandle) {
  try {
    const windows = await chrome.windows.getAll({populate: true})
    for (const window of windows) {
      if (window.id === undefined || window.tabs === undefined) return
      const tabs = formatTabs(window.tabs)
      const {headers, content} = jsonToMarkdown(tabs)
      const fileHandle = await subDirectoryHandle.getFileHandle(`${window.id}.md`, {
        create: true,
      })
      const writable = await fileHandle.createWritable()
      await writable.write(headers + content)
      await writable.close()
    }
  } catch (err) {
    console.error('saveAllWindows: ', err)
  }
}
