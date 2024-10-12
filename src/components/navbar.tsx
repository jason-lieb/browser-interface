import * as React from 'react'

export type NavPage = 'settings' | 'save' | 'browse'

type Props = {
  navPage: NavPage
  setNavPage: React.Dispatch<React.SetStateAction<NavPage>>
}

export function NavBar({navPage, setNavPage}: Props) {
  return (
    <div id="navbar">
      <NavButton page={'settings'} navPage={navPage} setNavPage={setNavPage} />
      <NavButton page={'save'} navPage={navPage} setNavPage={setNavPage} />
      <NavButton page={'browse'} navPage={navPage} setNavPage={setNavPage} />
    </div>
  )
}

function NavButton({
  navPage,
  setNavPage,
  page,
}: {
  navPage: NavPage
  setNavPage: React.Dispatch<React.SetStateAction<NavPage>>
  page: NavPage
}) {
  return (
    <button
      className={`navbar-button outline ${navPage === page ? 'primary' : 'secondary'}`}
      style={{margin: '1rem'}}
      onClick={() => setNavPage(page)}
    >
      {page.split('')[0].toUpperCase() + page.slice(1)}
    </button>
  )
}
