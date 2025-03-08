export const Alarms = {
  BackupOpenWindows: 'backupOpenWindows',
  SearchForOpenQueueFiles: 'searchForOpenQueueFiles',
  DeleteOpenQueueFiles: 'deleteOpenQueueFiles',
} as const

export type AlarmsT = (typeof Alarms)[keyof typeof Alarms]
