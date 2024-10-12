import * as React from 'react'

type Props = {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

export function ToggleIcon({collapsed, setCollapsed}: Props) {
  return (
    <div className={`${collapsed ? '' : 'rotate'} accordion`} onClick={() => setCollapsed(c => !c)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}
