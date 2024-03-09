import {formatTabs} from './format-data'
import {jsonToMarkdown} from './markdown'

export async function saveWindow(directoryHandle: FileSystemDirectoryHandle, inputText: string) {
  const window = await chrome.windows.getCurrent({populate: true})
  if (window.id === undefined) return
  const tabs = formatTabs(window.tabs as chrome.tabs.Tab[])

  const formattedInputText = inputText.trim().split('/')
  const fileName = formattedInputText.pop()
  if (fileName === undefined) return

  const subDirectoryHandle = await getSubDirectoryHandle(directoryHandle, formattedInputText)
  const fileHandle = await subDirectoryHandle.getFileHandle(`${fileName}.md`, {
    create: true,
  })

  const writable = await fileHandle.createWritable()
  await writable.write(jsonToMarkdown(tabs))
  await writable.close()

  chrome.windows.remove(window.id)
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
