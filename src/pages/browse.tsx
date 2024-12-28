import {useCallback, useEffect, useState} from 'react'
import {NavBar} from '../components/navbar'
import {ToggleIcon} from '../components/toggle-icon'
import {useDirectoryHandle} from '../store'
import {createWindowWithTabs} from '../utils/create-window'
import {clearDirectory} from '../utils/directory'
import {catchError, labelError, throwError} from '../utils/error'
import {getDirectoryEntries, loadFile, loadFileText} from '../utils/file-helpers'
import {TabT} from '../utils/format-tabs'

type Props = {
  backupDirectory: string
}

export function BrowsePage({backupDirectory}: Props) {
  const {directoryHandle, setDirectoryHandle} = useDirectoryHandle()
  const [currentDirectory, setCurrentDirectory] = useState<string[]>([])
  const [currentDirectoryHandles, setCurrentDirectoryHandles] = useState<
    FileSystemDirectoryHandle[]
  >([directoryHandle!])
  const currentDirectoryHandle = currentDirectoryHandles[currentDirectoryHandles.length - 1]!
  const [directories, setDirectories] = useState<[string, FileSystemDirectoryHandle][]>([])
  const [files, setFiles] = useState<[string, FileSystemFileHandle][]>([])

  const loadDirectoryEntries = useCallback(() => {
    getDirectoryEntries(directoryHandle!, currentDirectory)
      .then(result => {
        const [directories, files] = result
        setDirectories(directories)
        setFiles(files)
      })
      .catch(error => {
        console.error('getDirectoryEntriesError: ', error)
        clearDirectory(setDirectoryHandle)
      })
  }, [directoryHandle, setDirectoryHandle, currentDirectory])

  useEffect(() => {
    loadDirectoryEntries()
  }, [loadDirectoryEntries])

  const jumpDirectory = (
    jumpTo: string,
    direction: 'forwards' | 'backwards',
    newDirectoryHandle?: FileSystemDirectoryHandle
  ) => {
    if (direction === 'forwards' && newDirectoryHandle !== undefined) {
      setCurrentDirectory(x => [...x, jumpTo])
      setCurrentDirectoryHandles(x => [...x, newDirectoryHandle])
    }

    if (direction === 'backwards') {
      const index = currentDirectory.indexOf(jumpTo)
      if (index === -1) return

      setCurrentDirectory(d => d.slice(0, index + 1))
      setCurrentDirectoryHandles(d => d.slice(0, index + 2))
    }
  }

  const restoreBackup = () =>
    files.forEach(f =>
      loadFile(f[1]).then(createWindowWithTabs).catch(labelError('restoreBackupError'))
    )

  return (
    <div id="browseContainer">
      <NavBar />
      <div id="navbarSpacer"></div>
      <div id="filepath-container">
        <h3 id="filepath">
          /
          <LinkButton
            text={directoryHandle!.name}
            onClick={() => {
              setCurrentDirectory([])
              setCurrentDirectoryHandles([directoryHandle!])
            }}
          />
          {currentDirectory.map(d => (
            <>
              /
              <LinkButton text={d} onClick={() => jumpDirectory(d, 'backwards')} />
            </>
          ))}
        </h3>
        {backupDirectory !== '' && currentDirectory.join('/') === backupDirectory && (
          <button onClick={restoreBackup} id="restore-backup">
            Restore Backup
          </button>
        )}
      </div>
      <div id="browseResults" className="column-two container-fluid">
        {directories.map(d => (
          <Directory
            currentDirectoryHandle={currentDirectoryHandle}
            loadDirectoryEntries={loadDirectoryEntries}
            jumpDirectory={jumpDirectory}
            name={d[0]}
            key={d[0]}
          />
        ))}
        {files
          .filter(f => f[0] === 'Last Backup Timestamp.md')
          .map(f => (
            <LastBackupTimestamp handle={f[1]} key={f[0]} />
          ))}
        {files
          .filter(f => f[0] !== 'Last Backup Timestamp.md')
          .map(f => (
            <File
              currentDirectoryHandle={currentDirectoryHandle}
              loadDirectoryEntries={loadDirectoryEntries}
              handle={f[1]}
              name={f[0]}
              key={f[0]}
            />
          ))}
      </div>
    </div>
  )
}

function Directory({
  name,
  currentDirectoryHandle,
  loadDirectoryEntries,
  jumpDirectory,
}: {
  name: string
  currentDirectoryHandle: FileSystemDirectoryHandle
  loadDirectoryEntries: () => void
  jumpDirectory: (
    jumpTo: string,
    direction: 'forwards' | 'backwards',
    directoryHandle: FileSystemDirectoryHandle
  ) => void
}) {
  async function deleteDirectory() {
    const {error: directoryHandleError} = await catchError(currentDirectoryHandle.removeEntry(name))
    if (directoryHandleError) {
      console.error('deleteDirectoryError: ', directoryHandleError)
      alert(
        "Currently there is no support for deleting directories that aren't empty. Try again soon."
      )
      return
    }
    loadDirectoryEntries()
  }

  async function enterDirectory() {
    const {data: newDirectoryHandle, error: newDirectoryHandleError} = await catchError(
      currentDirectoryHandle.getDirectoryHandle(name, {
        create: false,
      })
    )
    if (newDirectoryHandleError) {
      console.error('enterDirectoryError: ', newDirectoryHandleError)
      return
    }
    jumpDirectory(name, 'forwards', newDirectoryHandle)
  }

  return (
    <div className="directory window hover-container">
      <button className="delete-directory danger hover-target" onClick={deleteDirectory}>
        X
      </button>
      <div className="hover-blank" />
      <div>
        <h4 className="directory-link">
          <LinkButton text={name} onClick={enterDirectory} />
        </h4>
      </div>
    </div>
  )
}

function LastBackupTimestamp({handle}: {handle: FileSystemFileHandle}) {
  const [timestamp, setTimestamp] = useState<string | null>(null)
  useEffect(() => {
    loadFileText(handle)
      .then(ts => (typeof ts === 'string' ? setTimestamp(ts) : setTimestamp(null)))
      .catch(labelError('loadFileError'))
  }, [handle])
  return (
    <div className={'window hover-container'}>
      <div />
      <h4 className={'file-link'}>Last Backup Timestamp: {timestamp}</h4>
    </div>
  )
}

function File({
  name,
  handle,
  currentDirectoryHandle,
  loadDirectoryEntries,
}: {
  name: string
  handle: FileSystemFileHandle
  currentDirectoryHandle: FileSystemDirectoryHandle
  loadDirectoryEntries: () => void
}) {
  const [tabs, setTabs] = useState<TabT[]>([])
  const [collapsed, setCollapsed] = useState(true)
  useEffect(() => {
    loadFile(handle).then(setTabs).catch(labelError('loadFileError'))
  }, [handle])

  async function openWindow() {
    const {error: createWindowWithTabsError} = await catchError(createWindowWithTabs(tabs))
    if (createWindowWithTabsError) {
      console.error('openWindowError: ', createWindowWithTabsError)
      return
    }
    const {error: removeEntryError} = await catchError(currentDirectoryHandle.removeEntry(name))
    if (removeEntryError) {
      console.error('removeEntryError: ', removeEntryError)
      return
    }
    loadDirectoryEntries()
  }

  return (
    <div className={`window hover-container ${collapsed ? '' : 'padding-bottom'}`}>
      <ToggleIcon collapsed={collapsed} setCollapsed={setCollapsed} />
      <div>
        <h4 className={`file-link ${collapsed ? '' : 'margin-bottom'}`}>
          <LinkButton text={stripExtension(name)} onClick={() => setCollapsed(x => !x)} />
          <button className="open-window hover-target" onClick={openWindow}>
            Open Window
          </button>
          <button
            className="open-window danger hover-target"
            onClick={() => {
              currentDirectoryHandle.removeEntry(name).catch(throwError('removeEntryError'))
              loadDirectoryEntries()
            }}
          >
            X
          </button>
        </h4>
        {!collapsed && <Tabs tabs={tabs} />}
      </div>
    </div>
  )
}

function Tabs({tabs}: {tabs: TabT[]}) {
  return (
    <div>
      {tabs.map(tab => (
        <Tab key={tab.url} {...tab} />
      ))}
    </div>
  )
}

function Tab({title, url, favIconUrl}: TabT) {
  return (
    <>
      {/* <div className={groupStyles}></div> */}
      <div className="tab-container hover-container-2">
        <div className="tab">
          <div className="tab-contents">
            {favIconUrl !== undefined && favIconUrl !== '' ? (
              <img src={favIconUrl} alt="Tab Fav Icon" className="fav-icon" />
            ) : (
              <div className="blank" />
            )}
            <a href={url}>
              <h6>{title}</h6>
            </a>
          </div>
          {/* <div className="tab-buttons">
            <button className="open-tab hover-target-2" onClick={() => console.log('test file')}>
              Open Tab
            </button>
            <button
              className="open-tab danger hover-target-2"
              onClick={() => console.log('test file')}
            >
              X
            </button>
          </div> */}
        </div>
        {/* <TabButtonGroup /> */}
      </div>
    </>
  )
}

function LinkButton({
  text,
  onClick,
  extraClass,
}: {
  text: string
  onClick: () => void
  extraClass?: string
}) {
  return (
    <button className={`linkButton ${extraClass}`} onClick={onClick}>
      {text}
    </button>
  )
}

function stripExtension(filename: string): string {
  if (filename.endsWith('.md')) return filename.slice(0, -3)
  return filename
}
