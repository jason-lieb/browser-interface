import * as React from 'react'
import {clearDirectory, selectDirectory, getDirectoryHandle} from './utils/directory'
import {saveWindow} from './utils/save-window'
import {BrowsePage} from './pages/browse'
import {NavBar, NavPage} from './components/navbar'
import {Backup} from './components/backup'

export function App() {
  const [directoryHandle, setDirectoryHandle] = React.useState<
    FileSystemDirectoryHandle | undefined
  >(undefined)
  const [backupDirectory, setBackupDirectory] = React.useState('')
  const [directoryInputText, setDirectoryInputText] = React.useState('')
  const [isSettingUpBackup, setIsSettingUpBackup] = React.useState(false)
  const [navPage, setNavPage] = React.useState<NavPage>('save')

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

  return (
    <>
      {directoryHandle === undefined ? (
        <div id="container">
          <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
        </div>
      ) : navPage === 'browse' ? (
        <BrowsePage
          directoryHandle={directoryHandle}
          setDirectoryHandle={setDirectoryHandle}
          navPage={navPage}
          setNavPage={setNavPage}
        />
      ) : (
        <div id="container">
          <NavBar navPage={navPage} setNavPage={setNavPage} />
          {navPage === 'settings' ? <SettingsPage /> : <SavePage />}
        </div>
      )}
    </>
  )

  function SettingsPage() {
    return (
      <>
        <div className="row">
          <p>
            <b>Directory: </b>
            {directoryHandle?.name}
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
        <Backup
          backupDirectory={backupDirectory}
          setBackupDirectory={setBackupDirectory}
          isSettingUpBackup={isSettingUpBackup}
          setIsSettingUpBackup={setIsSettingUpBackup}
          storeBackupDirectory={storeBackupDirectory}
          clearBackupDirectory={clearBackupDirectory}
        />
      </>
    )
  }

  function SavePage() {
    return (
      <form onSubmit={handleDirectory}>
        <div className="row">
          <label htmlFor="directoryInputText">
            <b>File Path: </b>
          </label>
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
    )
  }
}
