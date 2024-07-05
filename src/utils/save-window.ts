import {clearDirectory} from './directory'
import {formatTabs} from './format-data'
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

async function getSubDirectoryHandle(
  existingDirectoryHandle: FileSystemDirectoryHandle,
  directoryNames: string[]
): Promise<FileSystemDirectoryHandle> {
  if (directoryNames.length === 0) return existingDirectoryHandle
  const directoryHandles: FileSystemDirectoryHandle[] = [existingDirectoryHandle]

  for (const directoryName of directoryNames) {
    directoryHandles.push(
      await directoryHandles[directoryHandles.length - 1].getDirectoryHandle(directoryName, {
        create: true,
      })
    )
  }
  return directoryHandles.pop() as FileSystemDirectoryHandle
}

async function fileExists(
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<FileSystemFileHandle | null> {
  try {
    return await directoryHandle.getFileHandle(fileName)
  } catch (err) {
    return null
  }
}
