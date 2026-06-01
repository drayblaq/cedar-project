/* Cedar — Admin dashboard pages. Exports window.ADMIN */
(function () {
  const { useState } = React;
  const C = window.CEDAR;
  const { Icon, Card, StatCard, SectionHead, BarChart, LineChart, Ring, Table,
    Badge, LevelPill, Avatar, Note, Modal } = window;
  const k = (n) => Math.round(n / 1000) + "k";

  /* ── OVERVIEW ── */
  function Overview() {
    return (
      <div>
        <SectionHead title="Good morning, Aïcha" sub="Here's what's happening at the centre today — Saturday, 31 May 2026." />
        <div className="grid-stats">
          <StatCard icon="users" label="Total students" value={C.metrics.totalStudents} sub={`${C.metrics.activeStudents} active`} delta={6} />
          <StatCard icon="wallet" label="Revenue · May" value={C.fmtXOF(C.metrics.revenueMonth)} tone="gold" delta={12} />
          <StatCard icon="check" label="Attendance rate" value={C.metrics.attendanceRate + "%"} tone="blue" delta={2} />
          <StatCard icon="clock" label="Outstanding fees" value={C.fmtXOF(C.metrics.outstanding)} sub="across 8 students" tone="dark" />
        </div>

        <div className="grid-2-1" style={{ marginTop: 18 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <h3 className="card-title">Revenue trend</h3>
                <p className="card-sub">Last 6 months · in thousands CFA</p>
              </div>
              <Badge tone="green">+12% vs Apr</Badge>
            </div>
            <LineChart data={C.revenueByMonth} valueKey="v" labelKey="m" height={200} format={(v) => k(v * 1000)} />
          </Card>
          <Card>
            <h3 className="card-title">Students by level</h3>
            <p className="card-sub" style={{ marginBottom: 4 }}>CEFR distribution</p>
            <BarChart data={C.enrollmentByLevel} valueKey="count" labelKey="level" height={200} />
          </Card>
        </div>

        <div className="grid-2-1" style={{ marginTop: 18 }}>
          <Card pad={0}>
            <div style={{ padding: "18px 22px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="card-title">Recent payments</h3>
              <a className="link-btn">View all<Icon name="chevronR" size={15} /></a>
            </div>
            <Table
              columns={[
                { key: "student", label: "Student" },
                { key: "program", label: "Program" },
                { key: "amount", label: "Amount", align: "right" },
                { key: "status", label: "Status", align: "right" },
              ]}
              rows={C.payments.slice(0, 5)}
              renderCell={(r, key) =>
                key === "student" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={r.student} size={30} /><span style={{ fontWeight: 600 }}>{r.student}</span></div>
                ) : key === "amount" ? (
                  <span style={{ fontWeight: 700 }}>{C.fmtXOF(r.amount)}</span>
                ) : key === "status" ? (
                  <Badge tone={r.status === "paid" ? "green" : "gold"}>{r.status === "paid" ? "Paid" : "Partial"}</Badge>
                ) : <span style={{ color: "var(--muted)" }}>{r.program}</span>
              }
            />
          </Card>
          <Card>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Announcements</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {C.announcements.map((a) => (
                <div key={a.id} style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <Badge tone={a.tag === "Exam" ? "blue" : a.tag === "Notice" ? "gold" : "green"}>{a.tag}</Badge>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{C.fmtDate(a.date)}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", lineHeight: 1.35 }}>{a.title}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── STUDENTS ── */
  function Students() {
    const [q, setQ] = useState("");
    const [lvl, setLvl] = useState("All");
    const [adding, setAdding] = useState(false);
    const rows = C.students.filter((s) =>
      (lvl === "All" || s.level === lvl) && s.name.toLowerCase().includes(q.toLowerCase()));
    return (
      <div>
        <SectionHead title="Students" sub={`${C.students.length} enrolled · ${C.metrics.withLogin} with portal access`}
          action={<button className="btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={17} />Add student</button>} />
        <Modal open={adding} onClose={() => setAdding(false)} title="Add a student"
          sub="Enrol a new student and optionally issue a portal login."
          footer={<>
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => { setAdding(false); window.toast("Student enrolled"); }}><Icon name="check" size={16} />Enrol student</button>
          </>}>
          <div className="form-stack">
            <label className="fld"><span>Full name</span><input placeholder="e.g. Chimène Adjovi" /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="fld"><span>Level</span><select>{C.levels.map((l) => <option key={l}>{l}</option>)}</select></label>
              <label className="fld"><span>Program</span><select>{C.programs.map((p) => <option key={p.id}>{p.name}</option>)}</select></label>
            </div>
            <label className="fld"><span>Phone</span><input placeholder="+229 …" /></label>
            <label className="fld" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
              <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 600, color: "var(--ink)" }}>Send portal login invite</span>
            </label>
          </div>
        </Modal>
        <Card pad={0}>
          <div className="table-toolbar">
            <div className="search-field">
              <Icon name="search" size={17} />
              <input placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {["All", ...C.levels].map((l) => (
                <button key={l} onClick={() => setLvl(l)} className={"chip" + (lvl === l ? " chip-on" : "")}>{l}</button>
              ))}
            </div>
          </div>
          <Table
            columns={[
              { key: "name", label: "Student" },
              { key: "level", label: "Level" },
              { key: "program", label: "Program" },
              { key: "attendance", label: "Attend.", align: "center" },
              { key: "avgScore", label: "Avg", align: "center" },
              { key: "balance", label: "Balance", align: "right" },
              { key: "login", label: "Portal", align: "center" },
            ]}
            rows={rows}
            renderCell={(r, key) => {
              if (key === "name") return (
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <Avatar name={r.name} size={34} />
                  <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>{r.phone}</div></div>
                </div>);
              if (key === "level") return <LevelPill level={r.level} />;
              if (key === "program") return <span style={{ color: "var(--muted)" }}>{C.programName(r.program)}</span>;
              if (key === "attendance") return <span style={{ fontWeight: 700, color: r.attendance >= 85 ? "#1a8a2a" : r.attendance >= 75 ? "#9a7822" : "#b3402f" }}>{r.attendance}%</span>;
              if (key === "avgScore") return <span style={{ fontWeight: 700 }}>{r.avgScore}</span>;
              if (key === "balance") return r.balance === 0 ? <Badge tone="green">Settled</Badge> : <span style={{ fontWeight: 700, color: "#b3402f" }}>{C.fmtXOF(r.balance)}</span>;
              if (key === "login") return r.login ? <Icon name="check" size={17} style={{ color: "var(--green)" }} /> : <button className="mini-btn">Invite</button>;
              return r[key];
            }}
          />
        </Card>
      </div>
    );
  }

  /* ── PAYMENTS ── */
  function Payments() {
    const paidCount = C.payments.filter((p) => p.status === "paid").length;
    const [adding, setAdding] = useState(false);
    return (
      <div>
        <SectionHead title="Payments" sub="Record fees, track balances and issue receipts."
          action={<button className="btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={17} />Record payment</button>} />
        <Modal open={adding} onClose={() => setAdding(false)} title="Record a payment"
          sub="Log a fee payment and issue a receipt."
          footer={<>
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => { setAdding(false); window.toast("Payment recorded · receipt issued"); }}><Icon name="check" size={16} />Record payment</button>
          </>}>
          <div className="form-stack">
            <label className="fld"><span>Student</span><select><option>Select student…</option>{C.students.map((s) => <option key={s.id}>{s.name}</option>)}</select></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="fld"><span>Amount (CFA)</span><input type="number" placeholder="90000" /></label>
              <label className="fld"><span>Method</span><select><option>Mobile Money</option><option>Bank transfer</option><option>Cash</option></select></label>
            </div>
            <label className="fld"><span>For</span><select>{C.programs.map((p) => <option key={p.id}>{p.name}</option>)}</select></label>
          </div>
        </Modal>
        <div className="grid-stats-3">
          <StatCard icon="wallet" label="Collected · May" value={C.fmtXOF(C.metrics.revenueMonth)} tone="gold" delta={12} />
          <StatCard icon="clock" label="Outstanding" value={C.fmtXOF(C.metrics.outstanding)} sub="8 students" tone="dark" />
          <StatCard icon="check" label="Receipts issued" value={paidCount} sub="this month" tone="green" />
        </div>
        <Card pad={0} style={{ marginTop: 18 }}>
          <div style={{ padding: "18px 22px 6px" }}><h3 className="card-title">Transaction history</h3></div>
          <Table
            columns={[
              { key: "student", label: "Student" },
              { key: "program", label: "Program" },
              { key: "method", label: "Method" },
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount", align: "right" },
              { key: "status", label: "Status", align: "right" },
            ]}
            rows={C.payments}
            renderCell={(r, key) =>
              key === "student" ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={r.student} size={30} /><span style={{ fontWeight: 600 }}>{r.student}</span></div>
              : key === "amount" ? <span style={{ fontWeight: 700 }}>{C.fmtXOF(r.amount)}</span>
              : key === "date" ? <span style={{ color: "var(--muted)" }}>{C.fmtDate(r.date)}</span>
              : key === "status" ? <Badge tone={r.status === "paid" ? "green" : "gold"}>{r.status === "paid" ? "Paid" : "Partial"}</Badge>
              : key === "method" ? <span style={{ color: "var(--muted)" }}>{r.method}</span>
              : <span style={{ color: "var(--muted)" }}>{r.program}</span>}
          />
        </Card>
      </div>
    );
  }

  /* ── ATTENDANCE ── */
  function Attendance() {
    const roster = C.students.filter((s) => s.status === "active").slice(0, 10);
    const [marks, setMarks] = useState(() => Object.fromEntries(roster.map((s) => [s.id, s.attendance >= 80 ? "present" : "absent"])));
    const cycle = { present: "absent", absent: "late", late: "present" };
    const tone = { present: { bg: "rgba(46,168,42,.14)", fg: "#1a8a2a", t: "Present" }, absent: { bg: "rgba(201,74,58,.12)", fg: "#b3402f", t: "Absent" }, late: { bg: "rgba(212,168,67,.18)", fg: "#9a7822", t: "Late" } };
    const present = Object.values(marks).filter((m) => m === "present").length;
    return (
      <div>
        <SectionHead title="Attendance" sub="General English — B1 Morning · Saturday, 31 May 2026"
          action={<button className="btn-primary" onClick={() => window.toast("Register saved")}><Icon name="check" size={17} />Save register</button>} />
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div className="select-field"><Icon name="layers" size={16} /><select defaultValue="c1">{C.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="select-field"><Icon name="calendar" size={16} /><input type="date" defaultValue="2026-05-31" /></div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
            <Ring value={Math.round((present / roster.length) * 100)} size={42} stroke={5} /> {present}/{roster.length} present
          </div>
        </div>
        <Card pad={0}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {roster.map((s, i) => {
              const m = marks[s.id], tn = tone[m];
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                  borderBottom: i < roster.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <Avatar name={s.name} size={34} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>{C.programName(s.program)} · {s.level}</div></div>
                  <button onClick={() => setMarks({ ...marks, [s.id]: cycle[m] })}
                    style={{ border: "none", cursor: "pointer", background: tn.bg, color: tn.fg, fontWeight: 700,
                      fontSize: 12.5, padding: "7px 16px", borderRadius: 8, minWidth: 92 }}>{tn.t}</button>
                </div>
              );
            })}
          </div>
        </Card>
        <Note>Tap any status to cycle Present → Absent → Late. This register feeds each student's attendance %.</Note>
      </div>
    );
  }

  /* ── GRADES ── */
  function Grades() {
    return (
      <div>
        <SectionHead title="Grades & remarks" sub="Record scores and feedback by skill and term." />
        <div className="grid-2-1">
          <Card pad={0}>
            <div style={{ padding: "18px 22px 6px" }}><h3 className="card-title">Recent grades</h3></div>
            <Table
              columns={[
                { key: "student", label: "Student" },
                { key: "subject", label: "Skill" },
                { key: "term", label: "Term" },
                { key: "score", label: "Score", align: "center" },
                { key: "remark", label: "Remark" },
              ]}
              rows={C.grades}
              renderCell={(r, key) =>
                key === "student" ? <span style={{ fontWeight: 600 }}>{r.student}</span>
                : key === "score" ? <span style={{ fontWeight: 800, color: r.score >= 85 ? "#1a8a2a" : r.score >= 70 ? "#9a7822" : "#b3402f" }}>{r.score}</span>
                : key === "remark" ? <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{r.remark}</span>
                : <span style={{ color: "var(--muted)" }}>{r[key]}</span>}
            />
          </Card>
          <Card>
            <h3 className="card-title" style={{ marginBottom: 16 }}>Add a grade</h3>
            <div className="form-stack">
              <label className="fld"><span>Student</span><select><option>Select student…</option>{C.students.map((s) => <option key={s.id}>{s.name}</option>)}</select></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="fld"><span>Skill</span><select><option>Speaking</option><option>Writing</option><option>Reading</option><option>Listening</option></select></label>
                <label className="fld"><span>Score / 100</span><input type="number" placeholder="84" /></label>
              </div>
              <label className="fld"><span>Remark</span><textarea rows="3" placeholder="Confident speaker, expand academic vocabulary…"></textarea></label>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => window.toast("Grade saved")}>Save grade</button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── ANNOUNCEMENTS ── */
  function Announcements() {
    return (
      <div>
        <SectionHead title="Announcements" sub="Broadcast to students, parents and staff." />
        <div className="grid-2-1">
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
          <Card>
            <h3 className="card-title" style={{ marginBottom: 16 }}>New announcement</h3>
            <div className="form-stack">
              <label className="fld"><span>Title</span><input placeholder="e.g. Term 3 placement tests" /></label>
              <label className="fld"><span>Category</span><select><option>Academic</option><option>Notice</option><option>Exam</option></select></label>
              <label className="fld"><span>Message</span><textarea rows="5" placeholder="Write your announcement…"></textarea></label>
              <label className="fld"><span>Audience</span><select><option>Everyone</option><option>Students only</option><option>Parents only</option><option>Staff only</option></select></label>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => window.toast("Announcement published")}><Icon name="megaphone" size={16} />Publish</button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── CALENDAR ── */
  function Calendar() {
    const [adding, setAdding] = useState(false);
    const days = [];
    const first = new Date(2026, 5, 1).getDay(); // June 2026
    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= 30; d++) days.push(d);
    const evByDay = {};
    C.events.forEach((e) => { const d = parseInt(e.date.split("-")[2], 10); evByDay[d] = e; });
    const typeColor = { exam: "#3f7d8c", holiday: "#b3402f", event: "#d4a843", term: "#2ea82a" };
    return (
      <div>
        <SectionHead title="Academic calendar" sub="June 2026 · Term 3 schedule"
          action={<button className="btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={17} />Add event</button>} />
        <Modal open={adding} onClose={() => setAdding(false)} title="Add a calendar event"
          footer={<>
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => { setAdding(false); window.toast("Event added to calendar"); }}><Icon name="check" size={16} />Add event</button>
          </>}>
          <div className="form-stack">
            <label className="fld"><span>Title</span><input placeholder="e.g. IELTS mock exam" /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="fld"><span>Date</span><input type="date" defaultValue="2026-06-15" /></label>
              <label className="fld"><span>Type</span><select><option>exam</option><option>holiday</option><option>event</option><option>term</option></select></label>
            </div>
          </div>
        </Modal>
        <div className="grid-2-1">
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--muted)", padding: "4px 0", letterSpacing: "0.04em" }}>{d.toUpperCase()}</div>
              ))}
              {days.map((d, i) => {
                const ev = d && evByDay[d];
                return (
                  <div key={i} style={{ aspectRatio: "1", borderRadius: 9, padding: 6, fontSize: 12.5,
                    background: ev ? "var(--green-wash)" : d ? "var(--surface)" : "transparent",
                    border: ev ? "1px solid var(--green-soft)" : d ? "1px solid var(--border)" : "none",
                    display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontWeight: ev ? 800 : 600, color: ev ? "var(--green-deep)" : "var(--ink)" }}>{d}</span>
                    {ev && <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor[ev.type] }}></span>}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Upcoming events</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {C.events.map((e) => (
                <div key={e.id} style={{ display: "flex", gap: 13, alignItems: "center" }}>
                  <div style={{ width: 46, textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{e.date.split("-")[2]}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Jun</div>
                  </div>
                  <div style={{ width: 3, alignSelf: "stretch", borderRadius: 3, background: typeColor[e.type] }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{e.title}</div>
                    <Badge tone={e.type === "exam" ? "blue" : e.type === "holiday" ? "red" : e.type === "term" ? "green" : "gold"}>{e.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── CLASSES ── */
  function Classes() {
    const [adding, setAdding] = useState(false);
    return (
      <div>
        <SectionHead title="Classes" sub="Groups, schedules and staff assignments."
          action={<button className="btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={17} />New class</button>} />
        <Modal open={adding} onClose={() => setAdding(false)} title="Create a class"
          footer={<>
            <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => { setAdding(false); window.toast("Class created"); }}><Icon name="check" size={16} />Create class</button>
          </>}>
          <div className="form-stack">
            <label className="fld"><span>Class name</span><input placeholder="e.g. General English — B1 Morning" /></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="fld"><span>Level</span><select>{C.levels.map((l) => <option key={l}>{l}</option>)}</select></label>
              <label className="fld"><span>Instructor</span><select>{C.staff.map((t) => <option key={t.id}>{t.name}</option>)}</select></label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="fld"><span>Room</span><input placeholder="Salle 2" /></label>
              <label className="fld"><span>Schedule</span><input placeholder="Mon · Wed · Fri — 08:30" /></label>
            </div>
          </div>
        </Modal>
        <div className="grid-cards">
          {C.classes.map((cl) => {
            const teacher = C.staff.find((t) => t.id === cl.teacher);
            return (
              <Card key={cl.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <LevelPill level={cl.level} />
                  <Badge tone="neutral">{cl.count} students</Badge>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3, marginBottom: 12 }}>{cl.name}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5, color: "var(--muted)" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="clock" size={15} />{cl.schedule}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="pin" size={15} />{cl.room}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="user" size={15} />{teacher ? teacher.name : "Unassigned"}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  window.ADMIN = {
    user: { name: "Aïcha Mensah", role: "Administrator" },
    nav: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "students", label: "Students", icon: "users" },
      { id: "payments", label: "Payments", icon: "wallet" },
      { id: "attendance", label: "Attendance", icon: "check" },
      { id: "grades", label: "Grades", icon: "award" },
      { id: "classes", label: "Classes", icon: "layers" },
      { id: "announcements", label: "Announcements", icon: "megaphone" },
      { id: "calendar", label: "Calendar", icon: "calendar" },
    ],
    pages: { overview: Overview, students: Students, payments: Payments, attendance: Attendance,
      grades: Grades, classes: Classes, announcements: Announcements, calendar: Calendar },
  };
})();
