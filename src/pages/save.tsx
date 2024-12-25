import {Dispatch, FormEvent, SetStateAction, useEffect, useRef} from 'react'

type SavePageProps = {
  directoryInputText: string
  setDirectoryInputText: Dispatch<SetStateAction<string>>
  handleDirectory: (cb: () => void) => (event: FormEvent) => void
}

export function SavePage({
  directoryInputText,
  setDirectoryInputText,
  handleDirectory,
}: SavePageProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const focusInput = () => inputRef.current?.focus()
    document.addEventListener('visibilitychange', focusInput)
    return () => document.removeEventListener('visibilitychange', focusInput)
  }, [inputRef])

  return (
    <form onSubmit={handleDirectory(() => inputRef.current?.focus())}>
      <div className="row">
        <label htmlFor="directoryInputText">
          <b>File Path: </b>
        </label>
        <input
          ref={inputRef}
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
