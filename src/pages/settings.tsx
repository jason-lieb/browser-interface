import {Dispatch, SetStateAction, useEffect, useState} from 'react'
import {Backup} from '../components/backup'
import {useDirectoryHandle} from '../state'
import {clearDirectory} from '../utils/directory'
import {pinTab, unpinTab} from '../utils/pin-tab'

type SettingProps = {
  backupDirectory: string
  setBackupDirectory: Dispatch<SetStateAction<string>>
  storeBackupDirectory: (backupDirectory: string) => void
  clearBackupDirectory: () => void
}

export function SettingsPage({
  backupDirectory,
  setBackupDirectory,
  storeBackupDirectory,
  clearBackupDirectory,
}: SettingProps) {
  const {directoryHandle, setDirectoryHandle} = useDirectoryHandle()
  const [pinSetting, setPinSetting] = useState(false)

  useEffect(
    () =>
      chrome.storage.local.get(['pinSetting'], result => {
        if (result.pinSetting !== undefined) setPinSetting(result.pinSetting)
        if (result.pinSetting) pinTab()
      }),
    []
  )

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
        storeBackupDirectory={storeBackupDirectory}
        clearBackupDirectory={clearBackupDirectory}
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
