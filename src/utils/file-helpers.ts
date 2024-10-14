import {markdownToJson} from './markdown'

export async function getDirectoryEntries(
  directoryHandle: FileSystemDirectoryHandle,
  currentDirectory: string[]
): Promise<[[string, FileSystemDirectoryHandle][], [string, FileSystemFileHandle][]]> {
  const handle = await getSubDirectoryHandle(directoryHandle, currentDirectory)
  const directories = []
  const files = []
  for await (const entry of handle.entries()) {
    if (entry[1].kind === 'directory')
      directories.push(entry as [string, FileSystemDirectoryHandle])
    if (entry[1].kind === 'file') files.push(entry as [string, FileSystemFileHandle])
  }
  return [directories, files]
}

export async function loadFile(fileHandle: FileSystemFileHandle) {
  const file = await fileHandle.getFile()
  const reader = new FileReader()
  reader.readAsText(file)
  await new Promise(resolve => (reader.onloadend = resolve))
  if (reader.result === null) return []
  return markdownToJson(reader.result)
}

export async function getSubDirectoryHandle(
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

export async function fileExists(
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<FileSystemFileHandle | null> {
  try {
    return await directoryHandle.getFileHandle(fileName)
  } catch (err) {
    return null
  }
}
