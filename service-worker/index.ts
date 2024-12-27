import {Alarms} from './alarms'
import {backupOpenWindows} from './backup'
import {deleteOpenQueueFiles} from './delete'
import {loadBackupSubDirectory, loadDirectoryHandle} from './load'
import {searchForOpenQueueFiles} from './open'
import {store} from './store'
import {backgroundLog} from './utils/log'

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage())

chrome.alarms.onAlarm.addListener(alarm => {
  switch (alarm.name) {
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
      backgroundLog('Unexpected alarm: ', alarm.name)
  }
})

chrome.runtime.onMessage.addListener(message => {
  switch (message) {
    case 'New Directory Handle':
      init()
      break
    case 'Changed Backup Directory':
      loadBackupSubDirectory()
      break
    case 'Manually Run Backup':
      backupOpenWindows()
      break
    case 'Request Permission':
      break
    default:
      backgroundLog('Unexpected message: ', message)
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
