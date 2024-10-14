import * as React from 'react'

type SavePageProps = {
  directoryInputText: string
  setDirectoryInputText: React.Dispatch<React.SetStateAction<string>>
  handleDirectory: (event: React.FormEvent) => void
}

export function SavePage({
  directoryInputText,
  setDirectoryInputText,
  handleDirectory,
}: SavePageProps) {
  return (
    <form onSubmit={handleDirectory}>
      <div className="row">
        <label htmlFor="directoryInputText">
          <b>File Path: </b>
        </label>
        <input
          id="directoryInputText"
          type="text"
          autoFocus
          value={directoryInputText}
          onChange={e => setDirectoryInputText((e.target as HTMLInputElement).value)}
        />
      </div>
      <button className="save">Save Window</button>
    </form>
  )
}
