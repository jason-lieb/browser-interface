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
      console.log('Backup directory saved:', backupDirectory)
      chrome.runtime.sendMessage('Changed Backup Directory')
    })
  }

  function clearBackupDirectory() {
    setIsSettingUpBackup(false)
    setBackupDirectory('')
    storeBackupDirectory('')
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
      <>
        <div className="row">
          <div className="full-width">
            <p>
              <b>Backup Subdirectory: </b>
              {backupDirectory}
            </p>
          </div>
        </div>
        <div className="row">
          <button
            onClick={() => chrome.runtime.sendMessage('Manually Run Backup')}
            className="full-width"
          >
            Manually Run Backup
          </button>
        </div>
        <div className="row">
          <button onClick={clearBackupDirectory} className="full-width">
            Clear Backup Subdirectory
          </button>
        </div>
      </>
    ) : isSettingUpBackup ? (
      <form onSubmit={handleBackup}>
        <div className="row">
          <label htmlFor="backupInputText" className="directory-path">
            Directory Path:{' '}
          </label>
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
      <button className="full-width" onClick={() => setIsSettingUpBackup(true)}>
        Setup Subdirectory to Backup Open Windows
      </button>
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
            <button
              onClick={() => {
                clearBackupDirectory()
                clearDirectory(setDirectoryHandle)
              }}
            >
              Clear Directory
            </button>
          </div>
          <hr />
          <br />
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
          <br />
          {backupDirectoryNode}
        </div>
      ) : (
        <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
      )}
    </>
  )
}
