import {formatTabs} from './format-data'
import {jsonToMarkdown} from './markdown'

export async function saveWindow(directoryHandle: FileSystemDirectoryHandle, inputText: string) {
  if (inputText.trim() === '') return alert('Please enter a file path')
  const window = await chrome.windows.getCurrent({populate: true})
  if (window.id === undefined || window.tabs === undefined) return
  const tabs = formatTabs(window.tabs)
  const {headers, content} = jsonToMarkdown(tabs)

  const formattedInputText = inputText.trim().split('/')
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
