import {createStore} from 'zustand/vanilla'

type Store = {
  directoryHandle: FileSystemDirectoryHandle | undefined
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | undefined) => void

  backupSubdirectory: string | undefined
  setBackupSubdirectory: (path: string | undefined) => void

  processedFiles: Set<string>
  addProcessedFile: (file: string) => void
  removeProcessedFile: (file: string) => void

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

  processedFiles: new Set<string>(),
  addProcessedFile: (file: string) =>
    set(state => ({
      processedFiles: new Set([...state.processedFiles, file]),
    })),
  removeProcessedFile: (file: string) =>
    set(state => ({
      processedFiles: new Set([...state.processedFiles].filter(f => f !== file)),
    })),

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
