import {FormEvent, useEffect, useState} from 'react'
import {NavBar} from './components/navbar'
import {BrowsePage} from './pages/browse'
import {SavePage} from './pages/save'
import {SettingsPage} from './pages/settings'
import {useDirectoryHandle, useNavPage} from './store'
import {clearDirectory, selectDirectory} from './utils/directory'
import {catchError} from './utils/error'
import {getDirectoryHandle} from './utils/indexed-db'
import {Messages} from './utils/message'
import {MessagesT} from './utils/message'
import {pinTab} from './utils/pin-tab'
import {saveWindow} from './utils/save-window'
import {storeBackupDirectory} from './utils/store-backup-directory'

let exhaustiveCheck: never

export function App() {
  const {directoryHandle, setDirectoryHandle} = useDirectoryHandle()
  const [backupDirectory, setBackupDirectory] = useState('')
  const [directoryInputText, setDirectoryInputText] = useState('')
  const [pinSetting, setPinSetting] = useState(false)
  const [requestPermissionModalOpen, setRequestPermissionModalOpen] = useState(false)
  const {navPage, setNavPage} = useNavPage()
  const [backupLoading, setBackupLoading] = useState(false)
  useEffect(() => {
    const messageHandler = (message: MessagesT) => {
      switch (message) {
        case Messages.RequestPermission:
          if (directoryHandle) setRequestPermissionModalOpen(true)
          break
        case Messages.BackupCompleted:
          setBackupLoading(false)
          break
        case Messages.ChangedDirectoryHandle:
        case Messages.ChangedBackupDirectory:
        case Messages.ManuallyRunBackup:
          break
        default:
          exhaustiveCheck = message
          console.log('Unexpected message: ', exhaustiveCheck)
      }
    }
    chrome.runtime.onMessage.addListener(messageHandler)
    return () => chrome.runtime.onMessage.removeListener(messageHandler)
  }, [directoryHandle])

  useEffect(() => {
    async function load() {
      const directoryHandle = await getDirectoryHandle()
      setDirectoryHandle(directoryHandle)

      const result = await chrome.storage.local.get(['backupDirectory'])
      if (result.backupDirectory) {
        console.log('Backup directory found:', result.backupDirectory)
        setBackupDirectory(result.backupDirectory)
      } else {
        setBackupDirectory('')
      }
    }

    load()
  }, [setDirectoryHandle])

  // Reset to save page after 1 minute of inactivity
  useEffect(() => {
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
  }, [setNavPage])

  useEffect(
    () =>
      chrome.storage.local.get(['pinSetting'], result => {
        if (result.pinSetting !== undefined) setPinSetting(result.pinSetting)
        if (result.pinSetting) pinTab()
      }),
    [setPinSetting]
  )

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
              clearBackupDirectory={clearBackupDirectory}
              pinSetting={pinSetting}
              setPinSetting={setPinSetting}
              backupLoading={backupLoading}
              setBackupLoading={setBackupLoading}
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
