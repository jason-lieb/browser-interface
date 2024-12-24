import {catchError, labelError} from './catch-error'
import {fileExists, getSubDirectoryHandle} from './file-helpers'
import {formatTabs} from './format-tabs'
import {jsonToMarkdown} from './markdown'

export async function saveWindow(directoryHandle: FileSystemDirectoryHandle, inputText: string) {
  const trimmedInputText = inputText.trim().replace(/[<>:"\\|?*]/g, '')
  if (trimmedInputText === '' || trimmedInputText[0] === '/')
    return alert('Please enter a file path')

  const {data: window, error} = await catchError(chrome.windows.getCurrent({populate: true}))
  if (error) throw new Error(`Error getting current window: ${error}`)
  if (window.id === undefined || window.tabs === undefined)
    throw new Error('Window has no id or tabs')

  const tabs = formatTabs(window.tabs)
  const {headers, content} = jsonToMarkdown(tabs)

  const formattedInputText = trimmedInputText
    .split('/')
    .map(s => s.trim())
    .filter(s => s !== '')
  const fileName = formattedInputText.pop()
  if (fileName === undefined) return

  const {data: subDirectoryHandle, error: subDirectoryHandleError} = await catchError(
    getSubDirectoryHandle(directoryHandle, formattedInputText)
  )
  if (subDirectoryHandleError)
    throw new Error(`Error getting sub directory handle: ${subDirectoryHandleError}`)

  const fileAlreadyExists = await fileExists(subDirectoryHandle, `${fileName}.md`)

  if (fileAlreadyExists) {
    const {data: file, error: fileError} = await catchError(fileAlreadyExists.getFile())
    if (fileError) throw new Error(`Error getting file: ${fileError}`)

    const {data: existingContent, error: existingContentError} = await catchError(file.text())
    if (existingContentError)
      throw new Error(`Error getting existing content: ${existingContentError}`)

    const {data: writable, error: writableError} = await catchError(
      fileAlreadyExists.createWritable()
    )
    if (writableError) throw new Error(`Error creating writable: ${writableError}`)

    const {error: writeError} = await catchError(writable.write(existingContent + content))
    if (writeError) throw new Error(`Error writing to file: ${writeError}`)

    const {error: closeError} = await catchError(writable.close())
    if (closeError) throw new Error(`Error closing file: ${closeError}`)

    chrome.windows.remove(window.id).catch(labelError('Error removing window'))
  } else {
    const {data: fileHandle, error: fileHandleError} = await catchError(
      subDirectoryHandle.getFileHandle(`${fileName}.md`, {
        create: true,
      })
    )
    if (fileHandleError) throw new Error(`Error getting file handle: ${fileHandleError}`)

    const {data: writable, error: writableError} = await catchError(fileHandle.createWritable())
    if (writableError) throw new Error(`Error creating writable: ${writableError}`)

    const {error: writeError} = await catchError(writable.write(headers + content))
    if (writeError) throw new Error(`Error writing to file: ${writeError}`)

    const {error: closeError} = await catchError(writable.close())
    if (closeError) throw new Error(`Error closing file: ${closeError}`)

    chrome.windows.remove(window.id).catch(labelError('Error removing window'))
  }
}

export async function saveAllWindows(subDirectoryHandle: FileSystemDirectoryHandle) {
  const {data: windows, error} = await catchError(chrome.windows.getAll({populate: true}))
  if (error) throw new Error(`Error getting all windows: ${error}`)

  for (const window of windows) {
    if (window.id === undefined || window.tabs === undefined) {
      console.error('Window has no id or tabs')
      continue
    }
    const tabs = formatTabs(window.tabs)
    const {headers, content} = jsonToMarkdown(tabs)

    const {data: fileHandle, error} = await catchError(
      subDirectoryHandle.getFileHandle(`${window.id}.md`, {
        create: true,
      })
    )
    if (error) {
      console.error('Error getting file handle: ', error)
      continue
    }

    const {data: writable, error: writableError} = await catchError(fileHandle.createWritable())
    if (writableError) {
      console.error('Error creating writable: ', writableError)
      continue
    }

    const {error: writeError} = await catchError(writable.write(headers + content))
    if (writeError) throw new Error(`Error writing to file: ${writeError}`)

    const {error: closeError} = await catchError(writable.close())
    if (closeError) throw new Error(`Error closing file: ${closeError}`)
  }
}
