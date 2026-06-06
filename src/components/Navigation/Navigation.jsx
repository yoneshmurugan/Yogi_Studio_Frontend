import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';

export default function Navigation({ onLogin, onHome }) {
  return (
    <>
      <DesktopNav onLogin={onLogin} onHome={onHome} />
      <MobileNav onLogin={onLogin} onHome={onHome} />
    </>
  );
}
