import {useNavPage} from '../store'

export type NavPage = 'settings' | 'save' | 'browse'

export function NavBar() {
  return (
    <div id="navbar">
      <NavButton page="settings" />
      <NavButton page="save" />
      <NavButton page="browse" />
    </div>
  )
}

function NavButton({page}: {page: NavPage}) {
  const {navPage, setNavPage} = useNavPage()
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
