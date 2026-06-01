/* Cedar — Parent portal pages. Exports window.PARENT */
(function () {
  const { useState } = React;
  const C = window.CEDAR;
  const { Icon, Card, StatCard, SectionHead, Table, Badge, LevelPill, Ring, Avatar, Note } = window;

  // This parent is linked to two children
  const childIds = ["s05", "s06"]; // Mariam Tidjani (A1), Gérard Dossou (B1)
  const children = childIds.map((id) => C.students.find((s) => s.id === id));

  function ChildSwitcher({ active, onChange }) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        {children.map((c) => (
          <button key={c.id} onClick={() => onChange(c.id)}
            className={"child-tab" + (active === c.id ? " child-tab-on" : "")}>
            <Avatar name={c.name} size={26} />
            <span>{c.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    );
  }

  function Overview() {
    const [active, setActive] = useState("s05");
    const child = children.find((c) => c.id === active);
    return (
      <div>
        <SectionHead title="Your children" sub="Follow progress, attendance and fees for each child."
          action={<ChildSwitcher active={active} onChange={setActive} />} />
        <Card style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Avatar name={child.name} size={58} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>{child.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{C.programName(child.program)} · enrolled {C.fmtDate(child.enrolled)}</div>
          </div>
          <LevelPill level={child.level} />
        </Card>
        <div className="grid-stats">
          <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Ring value={child.attendance} size={84} stroke={8} label="present" />
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Attendance</div>
          </Card>
          <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Ring value={child.avgScore} size={84} stroke={8} label="avg" color="#bf9636" />
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Average score</div>
          </Card>
          <StatCard icon="wallet" label="Fees status" value={child.balance === 0 ? "Settled" : C.fmtXOF(child.balance)} sub={child.balance === 0 ? "No balance" : "Due"} tone={child.balance === 0 ? "green" : "dark"} />
          <StatCard icon="award" label="Current level" value={child.level} sub={C.programName(child.program)} tone="blue" />
        </div>
        <div className="grid-2-1" style={{ marginTop: 18 }}>
          <Card>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Latest announcements</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {C.announcements.map((a) => (
                <div key={a.id} style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <Badge tone={a.tag === "Exam" ? "blue" : a.tag === "Notice" ? "gold" : "green"}>{a.tag}</Badge>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{C.fmtDate(a.date)}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{a.title}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 className="card-title">Need to reach us?</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>Contact the administration about {child.name.split(" ")[0]}'s progress or fees.</p>
            <button className="btn-primary" style={{ justifyContent: "center" }} onClick={() => window.toast("Message sent to the centre")}><Icon name="mail" size={16} />Message the centre</button>
            <button className="btn-ghost" style={{ justifyContent: "center" }}><Icon name="phone" size={16} />+229 97 00 00 00</button>
          </Card>
        </div>
      </div>
    );
  }

  function ParentAttendance() {
    const tone = { present: "green", absent: "red", late: "gold" };
    return (
      <div>
        <SectionHead title="Attendance" sub="Mariam Tidjani · General English A1" />
        <div className="grid-2-1">
          <Card style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Ring value={91} size={130} stroke={12} label="present" />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Good attendance</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 280 }}>Mariam has attended most sessions this term. You'll be notified if she misses class.</p>
            </div>
          </Card>
          <Card pad={0}>
            <div style={{ padding: "18px 22px 6px" }}><h3 className="card-title">Recent sessions</h3></div>
            <Table
              columns={[{ key: "date", label: "Date" }, { key: "status", label: "Status", align: "right" }]}
              rows={C.attendanceLog}
              renderCell={(r, key) => key === "date" ? <span style={{ fontWeight: 600 }}>{C.fmtDate(r.date)}</span>
                : <Badge tone={tone[r.status]}>{r.status[0].toUpperCase() + r.status.slice(1)}</Badge>}
            />
          </Card>
        </div>
      </div>
    );
  }

  function ParentPayments() {
    const rows = [
      { date: "2026-05-12", program: "General English — A1", amount: 75000, method: "Mobile Money", status: "paid" },
      { date: "2026-02-08", program: "Placement & materials", amount: 20000, method: "Cash", status: "paid" },
      { date: "2026-01-12", program: "General English — A1", amount: 75000, method: "Mobile Money", status: "paid" },
    ];
    return (
      <div>
        <SectionHead title="Payment history" sub="Mariam Tidjani · all fees settled" />
        <div className="grid-stats-3">
          <StatCard icon="wallet" label="Total paid" value={C.fmtXOF(170000)} tone="green" />
          <StatCard icon="clock" label="Outstanding" value={C.fmtXOF(0)} sub="No balance" tone="gold" />
          <StatCard icon="doc" label="Receipts" value="3" sub="available to download" tone="blue" />
        </div>
        <Card pad={0} style={{ marginTop: 18 }}>
          <div style={{ padding: "18px 22px 6px" }}><h3 className="card-title">Transactions</h3></div>
          <Table
            columns={[{ key: "date", label: "Date" }, { key: "program", label: "For" }, { key: "method", label: "Method" }, { key: "amount", label: "Amount", align: "right" }, { key: "receipt", label: "", align: "right" }]}
            rows={rows}
            renderCell={(r, key) =>
              key === "date" ? <span style={{ fontWeight: 600 }}>{C.fmtDate(r.date)}</span>
              : key === "amount" ? <span style={{ fontWeight: 700 }}>{C.fmtXOF(r.amount)}</span>
              : key === "method" ? <span style={{ color: "var(--muted)" }}>{r.method}</span>
              : key === "receipt" ? <button className="mini-btn"><Icon name="download" size={14} />Receipt</button>
              : <span style={{ color: "var(--muted)" }}>{r.program}</span>}
          />
        </Card>
      </div>
    );
  }

  function ParentAnnouncements() {
    return (
      <div>
        <SectionHead title="Announcements" sub="News from Cedar Training Center." />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {C.announcements.map((a) => (
            <Card key={a.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--green-wash)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="megaphone" size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{a.title}</h3>
                  <Badge tone={a.tag === "Exam" ? "blue" : a.tag === "Notice" ? "gold" : "green"}>{a.tag}</Badge>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65 }}>{a.body}</p>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8, opacity: .8 }}>{C.fmtDate(a.date)}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  window.PARENT = {
    user: { name: "Rasaki Tidjani", role: "Parent · 2 children" },
    nav: [
      { id: "overview", label: "Overview", icon: "users" },
      { id: "attendance", label: "Attendance", icon: "check" },
      { id: "payments", label: "Payments", icon: "wallet" },
      { id: "announcements", label: "Announcements", icon: "megaphone" },
    ],
    pages: { overview: Overview, attendance: ParentAttendance, payments: ParentPayments, announcements: ParentAnnouncements },
  };
})();
