import {Alarms, AlarmsT} from './alarms'
import {backupOpenWindows} from './backup'
import {deleteOpenQueueFiles} from './delete'
import {loadBackupSubDirectory, loadDirectoryHandle} from './load'
import {searchForOpenQueueFiles} from './open'
import {store} from './store'
import {backgroundLog} from './utils/log'
import {Messages, MessagesT} from './utils/message'

let exhaustiveCheck: never

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())

chrome.alarms.onAlarm.addListener((alarm: chrome.alarms.Alarm) => {
  const alarmName = alarm.name as AlarmsT
  switch (alarmName) {
    case Alarms.BackupOpenWindows:
      backupOpenWindows()
      break
    case Alarms.SearchForOpenQueueFiles:
      searchForOpenQueueFiles()
      break
    case Alarms.DeleteOpenQueueFiles:
      deleteOpenQueueFiles()
      break
    default:
      exhaustiveCheck = alarmName
      backgroundLog('Unexpected alarm: ', exhaustiveCheck)
  }
})

chrome.runtime.onMessage.addListener((message: MessagesT) => {
  switch (message) {
    case Messages.ChangedDirectoryHandle:
      init()
      break
    case Messages.ChangedBackupDirectory:
      loadBackupSubDirectory()
      break
    case Messages.ManuallyRunBackup:
      backupOpenWindows().then(() => chrome.runtime.sendMessage(Messages.BackupCompleted))
      break
    case Messages.RequestPermission:
      break
    case Messages.BackupCompleted:
      break
    default:
      exhaustiveCheck = message
      backgroundLog('Unexpected message: ', exhaustiveCheck)
  }
})

init()

async function init() {
  await chrome.alarms.clearAll()
  await loadDirectoryHandle()
  if (store.getState().directoryHandle === undefined) return

  loadBackupSubDirectory()

  chrome.alarms.create(Alarms.SearchForOpenQueueFiles, {
    delayInMinutes: 0,
    periodInMinutes: 3,
  })

  chrome.alarms.create(Alarms.DeleteOpenQueueFiles, {
    delayInMinutes: 1,
    periodInMinutes: 3,
  })
}
