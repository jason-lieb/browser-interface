import {create} from 'zustand'
import {NavPage} from '../components/navbar'

type NavPageState = {navPage: NavPage; setNavPage: (navPage: NavPage) => void}

export const useNavPage = create<NavPageState>(set => ({
  navPage: 'save',
  setNavPage: (navPage: NavPage) => set({navPage}),
}))

type DirectoryHandleState = {
  directoryHandle: FileSystemDirectoryHandle | undefined
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle | undefined) => void
}

export const useDirectoryHandle = create<DirectoryHandleState>(set => ({
  directoryHandle: undefined,
  setDirectoryHandle: (directoryHandle: FileSystemDirectoryHandle | undefined) =>
    set({directoryHandle}),
}))
