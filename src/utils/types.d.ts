interface Window {
  showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
}

interface FileSystemDirectoryHandle {
  entries: () => AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>
  requestPermission: (input?: {mode: 'read' | 'readwrite'}) => Promise<string>
  queryPermission: () => Promise<string>
}
