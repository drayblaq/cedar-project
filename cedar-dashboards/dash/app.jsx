/* Cedar — dashboard app shell. Login + role switch + sidebar/topnav layouts. */
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const { Logo, Avatar } = window;
  const {
    useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle,
  } = window;

  const ROLES = {
    admin:   { key: "admin",   mod: () => window.ADMIN,   label: "Administrator", desc: "Full centre management — students, fees, analytics", icon: "grid" },
    staff:   { key: "staff",   mod: () => window.STAFF,   label: "Instructor",    desc: "Your classes, attendance and grading only", icon: "book" },
    student: { key: "student", mod: () => window.STUDENT, label: "Student",       desc: "Your progress, grades and timetable", icon: "user" },
    parent:  { key: "parent",  mod: () => window.PARENT,  label: "Parent",        desc: "Follow your children's progress and fees", icon: "heart" },
  };

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "navPattern": "sidebar",
    "accent": "#2ea82a",
    "density": "regular",
  }/*EDITMODE-END*/;

  /* ── LOGIN / ROLE SELECT ── */
  function Login({ onPick }) {
    return (
      <div className="login-wrap">
        <div className="login-brand">
          <div className="login-fern" aria-hidden="true"></div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <Logo light size={46} />
            <h1 className="login-h1">The complete platform<br/>for English learning<br/>in Cotonou.</h1>
            <p className="login-p">Manage students, fees, attendance and progress — all in one place. Sign in to your dashboard to continue.</p>
            <div className="login-stats">
              <div><div className="ls-n">500+</div><div className="ls-l">Students trained</div></div>
              <div><div className="ls-n">7</div><div className="ls-l">English levels</div></div>
              <div><div className="ls-n">98%</div><div className="ls-l">Satisfaction</div></div>
            </div>
          </div>
        </div>
        <div className="login-panel">
          <div style={{ width: "100%", maxWidth: 380 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>Welcome back</h2>
            <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, marginBottom: 26 }}>Choose a demo account to explore the dashboard.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.values(ROLES).map((r) => (
                <button key={r.key} className="role-card" onClick={() => onPick(r.key)}>
                  <div className="role-ic"><Icon name={r.icon} size={20} /></div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{r.label}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}>{r.desc}</div>
                  </div>
                  <Icon name="arrowR" size={17} style={{ color: "var(--muted)" }} />
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 22, textAlign: "center", lineHeight: 1.6 }}>
              Student logins are issued by the centre after enrolment.<br/>This is an interactive prototype with sample data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── TOPBAR (shared between layouts) ── */
  function Topbar({ user, onSwitch, compact }) {
    return (
      <div className="topbar">
        {!compact && <div className="search-field topbar-search">
          <Icon name="search" size={17} /><input placeholder="Search…" />
        </div>}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <button className="icon-btn" title="Notifications"><Icon name="bell" size={19} /><span className="dot"></span></button>
          <div className="topbar-user">
            <Avatar name={user.name} size={34} />
            <div className="tu-meta">
              <div className="tu-name">{user.name}</div>
              <div className="tu-role">{user.role}</div>
            </div>
          </div>
          <button className="icon-btn" title="Switch account" onClick={onSwitch}><Icon name="logout" size={18} /></button>
        </div>
      </div>
    );
  }

  /* ── SHELL ── */
  function Shell({ roleKey, t, setTweak, onSwitch }) {
    const role = ROLES[roleKey];
    const mod = role.mod();
    const [page, setPage] = useState(mod.nav[0].id);
    const PageComp = mod.pages[page] || (() => null);
    const sidebar = t.navPattern === "sidebar";

    const NavItems = ({ horizontal }) => (
      <>
        {mod.nav.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)}
            className={(horizontal ? "tnav-item" : "snav-item") + (page === n.id ? (horizontal ? " tnav-on" : " snav-on") : "")}>
            <Icon name={n.icon} size={horizontal ? 17 : 19} />
            <span>{n.label}</span>
          </button>
        ))}
      </>
    );

    if (sidebar) {
      return (
        <div className={"app-shell sidebar-layout dens-" + t.density}>
          <aside className="sidebar">
            <div className="sidebar-logo"><Logo light size={34} /></div>
            <div className="sidebar-section">Menu</div>
            <nav className="sidebar-nav"><NavItems /></nav>
            <div className="sidebar-foot">
              <div className="sidebar-role"><span className="role-dot"></span>{role.label}</div>
              <button className="snav-item" onClick={onSwitch}><Icon name="logout" size={19} /><span>Switch account</span></button>
            </div>
          </aside>
          <div className="main-col">
            <Topbar user={mod.user} onSwitch={onSwitch} />
            <main className="content"><PageComp /></main>
          </div>
        </div>
      );
    }
    // top-nav layout
    return (
      <div className={"app-shell topnav-layout dens-" + t.density}>
        <header className="topnav">
          <div className="topnav-inner">
            <Logo size={32} />
            <nav className="topnav-nav"><NavItems horizontal /></nav>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="icon-btn"><Icon name="bell" size={19} /><span className="dot"></span></button>
              <Avatar name={mod.user.name} size={32} />
              <button className="icon-btn" onClick={onSwitch} title="Switch account"><Icon name="logout" size={18} /></button>
            </div>
          </div>
        </header>
        <main className="content content-centered"><PageComp /></main>
      </div>
    );
  }

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [roleKey, setRoleKey] = useState(null);
    const [toast, setToast] = useState(null);

    React.useEffect(() => {
      document.documentElement.style.setProperty("--green", t.accent);
    }, [t.accent]);

    React.useEffect(() => {
      const fn = (e) => {
        setToast(e.detail);
        clearTimeout(window.__cedarToastT);
        window.__cedarToastT = setTimeout(() => setToast(null), 2600);
      };
      window.addEventListener("cedar-toast", fn);
      return () => window.removeEventListener("cedar-toast", fn);
    }, []);

    return (
      <>
        {roleKey
          ? <Shell roleKey={roleKey} t={t} setTweak={setTweak} onSwitch={() => setRoleKey(null)} />
          : <Login onPick={setRoleKey} />}
        {toast && (
          <div className="toast"><span className="tic"><Icon name="check" size={17} /></span>{toast}</div>
        )}
        <TweaksPanel>
          <TweakSection label="Navigation" />
          <TweakRadio label="Pattern" value={t.navPattern} options={["sidebar", "topnav"]}
            onChange={(v) => setTweak("navPattern", v)} />
          <TweakSection label="Appearance" />
          <TweakColor label="Accent" value={t.accent}
            options={["#2ea82a", "#1a6b18", "#3f7d8c", "#bf9636"]}
            onChange={(v) => setTweak("accent", v)} />
          <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]}
            onChange={(v) => setTweak("density", v)} />
        </TweaksPanel>
      </>
    );
  }

  window.CedarApp = App;
})();
