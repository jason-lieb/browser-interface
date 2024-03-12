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
    <>
      {directoryHandle ? (
        <div id="container">
          <div className="row">
            <p>
              <b>Directory: </b>
              {directoryHandle.name}
            </p>
            <button onClick={() => clearDirectory(setDirectoryHandle)}>Clear Directory</button>
          </div>
          <hr />
          <br />
          <div className="row">
            <label htmlFor="inputText">File Path: </label>
            <input
              id="inputText"
              type="text"
              value={inputText}
              onChange={e => setInputText((e.target as HTMLInputElement).value)}
            />
          </div>
          <button onClick={() => saveWindow(directoryHandle, inputText)} className="save">
            Save Window
          </button>
        </div>
      ) : (
        <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
      )}
    </>
  )
}
