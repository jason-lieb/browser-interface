import {FormEvent, useCallback, useEffect, useState} from 'react'
import {NavBar} from './components/navbar'
import {BrowsePage} from './pages/browse'
import {SavePage} from './pages/save'
import {SettingsPage} from './pages/settings'
import {useDirectoryHandle, useNavPage} from './state'
import {catchError} from './utils/catch-error'
import {clearDirectory, selectDirectory} from './utils/directory'
import {getDirectoryHandle} from './utils/indexed-db'
import {pinTab} from './utils/pin-tab'
import {saveWindow} from './utils/save-window'

export function App() {
  const {directoryHandle, setDirectoryHandle} = useDirectoryHandle()
  const [backupDirectory, setBackupDirectory] = useState('')
  const [directoryInputText, setDirectoryInputText] = useState('')
  const [pinSetting, setPinSetting] = useState(false)
  const [requestPermissionModalOpen, setRequestPermissionModalOpen] = useState(false)
  const {navPage, setNavPage} = useNavPage()

  const messageHandler = useCallback(
    (message: string) => {
      switch (message) {
        case 'Request Permission':
          if (directoryHandle) setRequestPermissionModalOpen(true)
        case 'New Directory Handle':
        case 'Changed Backup Directory':
        case 'Manually Run Backup':
          break
        default:
          console.log('Unexpected message: ', message)
      }
    },
    [setRequestPermissionModalOpen, directoryHandle]
  )

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler)
    return () => chrome.runtime.onMessage.removeListener(messageHandler)
  }, [messageHandler])

  useEffect(() => {
    loadDirectoryHandle()
    loadBackupDirectory()

    let resetNavPageTimeout: NodeJS.Timeout

    function handleVisibilityChange() {
      if (document.hidden) {
        resetNavPageTimeout = setTimeout(() => {
          setNavPage('save')
        }, 60 * 1000)
      } else {
        clearTimeout(resetNavPageTimeout)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeout(resetNavPageTimeout)
    }
  }, [])

  useEffect(
    () =>
      chrome.storage.local.get(['pinSetting'], result => {
        if (result.pinSetting !== undefined) setPinSetting(result.pinSetting)
        if (result.pinSetting) pinTab()
      }),
    []
  )

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

  const handleDirectory = (cb: () => void) => (event: FormEvent) => {
    event.preventDefault()
    if (directoryHandle) {
      saveWindow(directoryHandle, directoryInputText).then(() => {
        setDirectoryInputText('')
        cb()
      })
    }
  }

  async function requestPermission() {
    if (!directoryHandle) return
    const {error} = await catchError(directoryHandle.requestPermission({mode: 'readwrite'}))
    if (error) console.error('Error requesting write permission:', error)
    setRequestPermissionModalOpen(false)
  }

  return (
    <>
      {directoryHandle === undefined ? (
        <button onClick={() => selectDirectory(setDirectoryHandle)}>Select Directory</button>
      ) : requestPermissionModalOpen ? (
        <>
          <button onClick={requestPermission}>Request Permission for Your Directory</button>
          <hr />
          <button onClick={() => setRequestPermissionModalOpen(false)}>Cancel</button>
          <hr />
          <button
            onClick={() => {
              clearBackupDirectory()
              setRequestPermissionModalOpen(false)
              clearDirectory(setDirectoryHandle)
            }}
          >
            Clear Directory
          </button>
        </>
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
              pinSetting={pinSetting}
              setPinSetting={setPinSetting}
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
