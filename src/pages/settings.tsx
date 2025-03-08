import {Dispatch, SetStateAction} from 'react'
import {Backup} from '../components/backup'
import {useDirectoryHandle} from '../store'
import {clearDirectory} from '../utils/directory'
import {pinTab, unpinTab} from '../utils/pin-tab'

type SettingProps = {
  backupDirectory: string
  setBackupDirectory: Dispatch<SetStateAction<string>>
  clearBackupDirectory: () => void
  pinSetting: boolean
  setPinSetting: (pinSetting: boolean) => void
  backupLoading: boolean
  setBackupLoading: (backupLoading: boolean) => void
}

export function SettingsPage({
  backupDirectory,
  setBackupDirectory,
  clearBackupDirectory,
  pinSetting,
  setPinSetting,
  backupLoading,
  setBackupLoading,
}: SettingProps) {
  const {directoryHandle, setDirectoryHandle} = useDirectoryHandle()

  const storePinSetting = (pinSetting: boolean) => {
    if (pinSetting) {
      pinTab()
    } else {
      unpinTab()
    }
    chrome.storage.local.set({pinSetting}, () => setPinSetting(pinSetting))
  }

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
        clearBackupDirectory={clearBackupDirectory}
        backupLoading={backupLoading}
        setBackupLoading={setBackupLoading}
      />
      <hr />
      <br />
      <div className="row center">
        <fieldset>
          <label>
            <input
              name="opt-in"
              type="checkbox"
              role="switch"
              checked={pinSetting}
              onClick={e => storePinSetting((e.target as HTMLInputElement).checked)}
            />
            Pin Browser Interface Tab
          </label>
        </fieldset>
      </div>
    </>
  )
}
