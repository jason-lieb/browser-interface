export function storeBackupDirectory(backupDirectory: string) {
  chrome.storage.local.set({backupDirectory}, () => {
    console.log('Backup directory saved:', backupDirectory)
    chrome.runtime.sendMessage('Changed Backup Directory')
  })
}
