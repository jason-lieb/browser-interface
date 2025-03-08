export const Messages = {
  ChangedDirectoryHandle: 'Changed Directory Handle',
  ChangedBackupDirectory: 'Changed Backup Directory',
  ManuallyRunBackup: 'Manually Run Backup',
  BackupCompleted: 'Backup Completed',
  RequestPermission: 'Request Permission',
} as const

export type MessagesT = (typeof Messages)[keyof typeof Messages]
