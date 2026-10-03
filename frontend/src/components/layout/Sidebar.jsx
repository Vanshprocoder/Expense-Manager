import { NavLink } from "react-router-dom";
import { LayoutDashboard, Store, User, Home, Wallet } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/personal", label: "Personal", icon: User },
  { to: "/home", label: "Home", icon: Home },
  { to: "/balances", label: "Balances", icon: Wallet },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Ledgerly</h1>
        <p>Finance manager</p>
      </div>
      <ul className="nav-list">
        {links.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <Icon strokeWidth={1.75} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
