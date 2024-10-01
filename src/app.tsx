import * as React from 'react'
import {clearDirectory, selectDirectory, getDirectoryHandle} from './utils/directory'
import {saveWindow} from './utils/save-window'

export default function App() {
  const [directoryHandle, setDirectoryHandle] = React.useState<
    FileSystemDirectoryHandle | undefined
  >(undefined)
  const [backupDirectory, setBackupDirectory] = React.useState('')

  const [directoryInputText, setDirectoryInputText] = React.useState('')
  const [backupInputText, setBackupInputText] = React.useState('')

  const [isSettingUpBackup, setIsSettingUpBackup] = React.useState(false)

  React.useEffect(() => {
    loadDirectoryHandle()
    loadBackupDirectory()
  }, [])

  async function loadDirectoryHandle() {
    const directoryHandle = await getDirectoryHandle()
    setDirectoryHandle(directoryHandle)
  }

  function loadBackupDirectory() {
    chrome.storage.local.get(['backupDirectory'], result => {
      if (result.backupDirectory) {
        console.log('Backup directory found:', result.backupDirectory)
        setBackupDirectory(result.backupDirectory)
      } else {
        console.log('Backup directory not found')
      }
    })
  }

  function storeBackupDirectory(backupDirectory: string) {
    chrome.storage.local.set({backupDirectory}, () => {
      console.log('Backup directory saved:', {backupDirectory})
    })
  }

  function clearBackupDirectory() {
    setIsSettingUpBackup(false)
    setBackupDirectory('')
  }

  const handleDirectory = (event: React.FormEvent) => {
    event.preventDefault()
    if (directoryHandle) {
      saveWindow(directoryHandle, setDirectoryHandle, directoryInputText)
    }
  }

  const handleBackup = (event: React.FormEvent) => {
    event.preventDefault()
    const backupDirectory = backupInputText
      .split('/')
      .map(s => s.trim())
      .join('/')
    setBackupDirectory(backupDirectory)
    storeBackupDirectory(backupDirectory)
    setIsSettingUpBackup(false)
    setBackupInputText('')
  }

  const backupDirectoryNode =
    backupDirectory !== '' ? (
      <div className="row">
        <div className="row">
          <p>
            <b>Backup Subdirectory: </b>
            {backupDirectory}
          </p>
        </div>
        <div className="row">
          <button onClick={clearBackupDirectory}>Clear Backup Subdirectory</button>
        </div>
      </div>
    ) : isSettingUpBackup ? (
      <form onSubmit={handleBackup}>
        <div className="row">
          <label htmlFor="backupInputText">Directory Path: </label>
          <input
            id="backupInputText"
            type="text"
            autoFocus
            value={backupInputText}
            onChange={e => setBackupInputText((e.target as HTMLInputElement).value)}
          />
        </div>
        <button className="save">Save Backup Subdirectory</button>
      </form>
    ) : (
      <div className="row">
        <button onClick={() => setIsSettingUpBackup(true)}>Setup Backup Subdirectory</button>
      </div>
    )

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
          <form onSubmit={handleDirectory}>
            <div className="row">
              <label htmlFor="directoryInputText">File Path: </label>
              <input
                id="directoryInputText"
                type="text"
                autoFocus
                value={directoryInputText}
                onChange={e => setDirectoryInputText((e.target as HTMLInputElement).value)}
              />
            </div>
            <button className="save">Save Window</button>
          </form>
          <hr />
          <h6 style={{marginTop: 0}}>** Experimental **</h6>
          {backupDirectoryNode}
        </div>
      ) : (
        <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
      )}
    </>
  )
}
