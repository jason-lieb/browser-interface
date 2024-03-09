import * as React from 'react'
import {clearDirectory, selectDirectory, getDirectoryHandle} from './utils/directory'
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
      {directoryHandle ? (
        <>
          <p>Directory: {directoryHandle.name}</p>
          <button onClick={() => clearDirectory(setDirectoryHandle)}>Clear Directory</button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText((e.target as HTMLInputElement).value)}
          />
          <button onClick={() => saveWindow(directoryHandle, inputText)}>Save Window</button>
        </>
      ) : (
        <>
          <p>No directory selected</p>
          <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
        </>
      )}
    </div>
  )
}
