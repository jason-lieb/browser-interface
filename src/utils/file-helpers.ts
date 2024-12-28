import {catchError} from './error'
import {markdownToJson} from './markdown'

export async function getDirectoryEntries(
  directoryHandle: FileSystemDirectoryHandle,
  currentDirectory: string[]
): Promise<[[string, FileSystemDirectoryHandle][], [string, FileSystemFileHandle][]]> {
  const {data: handle, error} = await catchError(
    getSubDirectoryHandle(directoryHandle, currentDirectory)
  )
  if (error) throw new Error(`Error getting subdirectory handle: ${error}`)

  const directories = []
  const files = []
  for await (const entry of handle.entries()) {
    switch (entry[1].kind) {
      case 'directory':
        directories.push(entry as [string, FileSystemDirectoryHandle])
        break
      case 'file':
        files.push(entry as [string, FileSystemFileHandle])
        break
      default:
        console.error(`Unknown entry kind: ${entry[1]}`)
    }
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

export async function loadFileText(fileHandle: FileSystemFileHandle) {
  const file = await fileHandle.getFile()

  const reader = new FileReader()
  reader.readAsText(file)
  await new Promise(resolve => (reader.onloadend = resolve))

  if (reader.result === null) return []
  return reader.result as string
}

export async function getSubDirectoryHandle(
  existingDirectoryHandle: FileSystemDirectoryHandle,
  directoryNames: string[]
): Promise<FileSystemDirectoryHandle> {
  if (directoryNames.length === 0) return existingDirectoryHandle
  const directoryHandles: FileSystemDirectoryHandle[] = [existingDirectoryHandle]

  for (const directoryName of directoryNames) {
    const {data: directoryHandle, error} = await catchError(
      directoryHandles[directoryHandles.length - 1]!.getDirectoryHandle(directoryName, {
        create: true,
      })
    )
    if (error) throw new Error(`Error getting subdirectory ${directoryName} handle: ${error}`)

    directoryHandles.push(directoryHandle)
  }
  return directoryHandles.pop()!
}

export async function fileExists(
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<FileSystemFileHandle | null> {
  const {data: fileHandle, error} = await catchError(directoryHandle.getFileHandle(fileName))
  if (error) return null
  return fileHandle
}
