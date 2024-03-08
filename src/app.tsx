import * as React from 'react'
import {getDirectoryHandle} from './utils/get-directory-handle'
import {selectDirectory} from './utils/select-directory'
import {saveWindow} from './utils/save-window'

export default function App() {
  const [directoryHandle, setDirectoryHandle] = React.useState<
    FileSystemDirectoryHandle | undefined
  >(undefined)

  const [inputText, setInputText] = React.useState('')

  React.useEffect(() => {
    async function loadDirectoryHandle() {
      const directoryHandle = await getDirectoryHandle()
      setDirectoryHandle(directoryHandle)
    }
    loadDirectoryHandle()
  }, [])

  return (
    <div id="container">
      {directoryHandle ? <p>{directoryHandle.name}</p> : <p>No directory selected</p>}
      {directoryHandle ? (
        <button
          onClick={() => {
            try {
              indexedDB.deleteDatabase('DirectoryHandle')
              setDirectoryHandle(undefined)
            } catch (e) {
              throw new Error(e as string)
            }
          }}
        >
          Clear Directory
        </button>
      ) : (
        <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
      )}
      {directoryHandle !== undefined && (
        <>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText((e.target as HTMLInputElement).value)}
          />
          <button onClick={() => saveWindow(directoryHandle, inputText)}>Save Window</button>
        </>
      )}
    </div>
  )
}
