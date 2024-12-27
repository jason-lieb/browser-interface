import {createStore} from 'zustand/vanilla'

type Store = {
  directoryHandle: FileSystemDirectoryHandle | undefined
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | undefined) => void

  backupSubdirectory: string | undefined
  setBackupSubdirectory: (path: string | undefined) => void

  filesToDelete: Set<string>
  addFileToDelete: (file: string) => void
  removeFileToDelete: (file: string) => void
}

export const store = createStore<Store>(set => ({
  directoryHandle: undefined,
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | undefined) =>
    set({directoryHandle: handle}),

  backupSubdirectory: undefined,
  setBackupSubdirectory: (path: string | undefined) => set({backupSubdirectory: path}),

  filesToDelete: new Set<string>(),
  addFileToDelete: (file: string) =>
    set(state => ({
      filesToDelete: new Set([...state.filesToDelete, file]),
    })),
  removeFileToDelete: (file: string) =>
    set(state => ({
      filesToDelete: new Set([...state.filesToDelete].filter(f => f !== file)),
    })),
}))
