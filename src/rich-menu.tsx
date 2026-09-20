import { CalendarDays, Home, Medal, Sparkles, UserRound, UsersRound } from "lucide-react";
import { createRoot } from "react-dom/client";
import "./styles/rich-menu.css";

const items = [
  { label: "Home", detail: "Camp at a glance", icon: Home, tone: "pink" },
  { label: "My Group", detail: "Members and mentors", icon: UsersRound, tone: "green" },
  { label: "Scoreboard", detail: "Live group standings", icon: Medal, tone: "gold" },
  { label: "Buddy / Budder", detail: "Your latest pairing", icon: Sparkles, tone: "coral" },
  { label: "Activities", detail: "Camp programme", icon: CalendarDays, tone: "blue" },
  { label: "My Profile", detail: "Registration details", icon: UserRound, tone: "forest" },
];

export function RichMenu() {
  return (
    <main className="rich-menu">
      {items.map(({ label, detail, icon: Icon, tone }, index) => (
        <section className={`rich-menu__item rich-menu__item--${tone}`} key={label}>
          <span className="rich-menu__number">0{index + 1}</span>
          <span className="rich-menu__icon"><Icon strokeWidth={2.2} /></span>
          <div><h1>{label}</h1><p>{detail}</p></div>
          {index === 0 && <span className="rich-menu__brand">CHULA CHIANG MAI · CAMP 2026</span>}
        </section>
      ))}
    </main>
  );
}

createRoot(document.getElementById("rich-menu-root")!).render(<RichMenu />);
