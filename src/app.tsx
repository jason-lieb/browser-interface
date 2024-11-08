import * as React from 'react'
import {selectDirectory} from './utils/directory'
import {getDirectoryHandle} from './utils/indexed-db'
import {saveWindow} from './utils/save-window'
import {BrowsePage} from './pages/browse'
import {NavBar} from './components/navbar'
import {useDirectoryHandle, useNavPage} from './state'
import {SettingsPage} from './pages/settings'
import {SavePage} from './pages/save'

export function App() {
  const {directoryHandle, setDirectoryHandle} = useDirectoryHandle()
  const [backupDirectory, setBackupDirectory] = React.useState('')
  const [directoryInputText, setDirectoryInputText] = React.useState('')
  const {navPage, setNavPage} = useNavPage()

  React.useEffect(() => {
    loadDirectoryHandle()
    loadBackupDirectory()

    let resetNavPageTimeout: NodeJS.Timeout

    function handleVisibilityChange() {
      console.log('handleVisibilityChange')
      if (document.hidden) {
        console.log('handleVisibilityChange: document hidden')
        resetNavPageTimeout = setTimeout(() => {
          setNavPage('save')
        }, 60 * 1000)
      } else {
        console.log('handleVisibilityChange: document not hidden')
        clearTimeout(resetNavPageTimeout)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeout(resetNavPageTimeout)
    }
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
    setBackupDirectory('')
    storeBackupDirectory('')
  }

  const handleDirectory = (event: React.FormEvent) => {
    event.preventDefault()
    if (directoryHandle) {
      saveWindow(directoryHandle, setDirectoryHandle, directoryInputText)
      setDirectoryInputText('')
    }
  }

  return (
    <>
      {directoryHandle === undefined ? (
        <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
      ) : navPage === 'browse' ? (
        <BrowsePage backupDirectory={backupDirectory} />
      ) : (
        <div id="container">
          <NavBar />
          {navPage === 'settings' ? (
            <SettingsPage
              backupDirectory={backupDirectory}
              setBackupDirectory={setBackupDirectory}
              storeBackupDirectory={storeBackupDirectory}
              clearBackupDirectory={clearBackupDirectory}
            />
          ) : (
            <SavePage
              directoryInputText={directoryInputText}
              setDirectoryInputText={setDirectoryInputText}
              handleDirectory={handleDirectory}
            />
          )}
        </div>
      )}
    </>
  )
}
