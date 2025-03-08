import {Dispatch, FormEvent, SetStateAction, useState} from 'react'
import {Messages} from '../utils/message'
import {storeBackupDirectory} from '../utils/store-backup-directory'

type Props = {
  backupDirectory: string
  setBackupDirectory: Dispatch<SetStateAction<string>>
  clearBackupDirectory: () => void
  backupLoading: boolean
  setBackupLoading: (backupLoading: boolean) => void
}

export function Backup({
  backupDirectory,
  setBackupDirectory,
  clearBackupDirectory,
  backupLoading,
  setBackupLoading,
}: Props) {
  const [backupInputText, setBackupInputText] = useState('')
  const [isSettingUpBackup, setIsSettingUpBackup] = useState(false)

  const handleBackup = (event: FormEvent) => {
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

  return backupDirectory !== '' ? (
    <>
      <div className="row">
        <div className="wide-500">
          <p>
            <b>Backup Subdirectory: </b>
            {backupDirectory}
          </p>
        </div>
      </div>
      <div className="row">
        <button
          onClick={() => {
            setBackupLoading(true)
            chrome.runtime.sendMessage(Messages.ManuallyRunBackup)
          }}
          className="wide-500"
          disabled={backupLoading}
        >
          {backupLoading ? 'Backup in Progress...' : 'Manually Run Backup'}
        </button>
      </div>
      <div className="row">
        <button onClick={clearBackupDirectory} className="wide-500">
          Clear Backup Subdirectory
        </button>
      </div>
    </>
  ) : isSettingUpBackup ? (
    <form onSubmit={handleBackup}>
      <div className="row">
        <label htmlFor="backupInputText" className="directory-path">
          <b>Directory Path: </b>
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
    <>
      <button className="wide-500" onClick={() => setIsSettingUpBackup(true)}>
        Setup Subdirectory to Backup Open Windows
      </button>
      <br />
    </>
  )
}
