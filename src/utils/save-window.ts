import {formatWindow} from './format-data'

export async function saveWindow(directoryHandle: FileSystemDirectoryHandle, inputText: string) {
  const rawWindow = await chrome.windows.getCurrent({populate: true})
  const window = formatWindow(rawWindow)
  console.log({window})
  const formattedInputText = inputText.trim().split('/')
  const fileName = formattedInputText.pop()
  if (!fileName || !fileName.length) return
  const subDirectoryHandle = await getSubDirectoryHandle(directoryHandle, formattedInputText)
  const fileHandle = await subDirectoryHandle.getFileHandle(`${fileName}.json`, {create: true})
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(window))
  await writable.close()
  chrome.windows.remove(window.id as number)
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
