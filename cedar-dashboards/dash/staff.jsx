/* Cedar — Staff dashboard pages. Exports window.STAFF */
(function () {
  const { useState } = React;
  const C = window.CEDAR;
  const { Icon, Card, StatCard, SectionHead, Table, Badge, LevelPill, Avatar, Ring, Note } = window;

  const myClasses = C.classes.filter((cl) => cl.teacher === "t1"); // Daniel Okonkwo

  function MyClasses() {
    const totalStudents = myClasses.reduce((a, c) => a + c.count, 0);
    return (
      <div>
        <SectionHead title="Welcome back, Daniel" sub="You teach 2 classes this term · 25 students total." />
        <div className="grid-stats-3">
          <StatCard icon="layers" label="My classes" value={myClasses.length} tone="green" />
          <StatCard icon="users" label="My students" value={totalStudents} tone="blue" />
          <StatCard icon="check" label="Avg attendance" value="89%" tone="gold" delta={3} />
        </div>
        <div className="grid-cards" style={{ marginTop: 18 }}>
          {myClasses.map((cl) => (
            <Card key={cl.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <LevelPill level={cl.level} /><Badge tone="neutral">{cl.count} students</Badge>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3, marginBottom: 12 }}>{cl.name}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5, color: "var(--muted)", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="clock" size={15} />{cl.schedule}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="pin" size={15} />{cl.room}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => window.toast("Opening attendance…")}><Icon name="check" size={16} />Attendance</button>
                <button className="btn-ghost" onClick={() => window.toast("Opening grades…")}><Icon name="award" size={16} />Grades</button>
              </div>
            </Card>
          ))}
        </div>
        <Note>Finance, other teachers' classes and centre-wide settings are hidden from staff accounts — you only see what you teach.</Note>
      </div>
    );
  }

  function StaffAttendance() {
    const roster = C.students.filter((s) => s.level === "B1").slice(0, 8);
    const [marks, setMarks] = useState(() => Object.fromEntries(roster.map((s) => [s.id, "present"])));
    const cycle = { present: "absent", absent: "late", late: "present" };
    const tone = { present: { bg: "rgba(46,168,42,.14)", fg: "#1a8a2a", t: "Present" }, absent: { bg: "rgba(201,74,58,.12)", fg: "#b3402f", t: "Absent" }, late: { bg: "rgba(212,168,67,.18)", fg: "#9a7822", t: "Late" } };
    const present = Object.values(marks).filter((m) => m === "present").length;
    return (
      <div>
        <SectionHead title="Mark attendance" sub="General English — B1 Morning · 31 May 2026"
          action={<button className="btn-primary" onClick={() => window.toast("Register saved")}><Icon name="check" size={17} />Save register</button>} />
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div className="select-field"><Icon name="layers" size={16} /><select>{myClasses.map((c) => <option key={c.id}>{c.name}</option>)}</select></div>
          <div className="select-field"><Icon name="calendar" size={16} /><input type="date" defaultValue="2026-05-31" /></div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
            <Ring value={Math.round((present / roster.length) * 100)} size={42} stroke={5} />{present}/{roster.length}
          </div>
        </div>
        <Card pad={0}>
          {roster.map((s, i) => {
            const m = marks[s.id], tn = tone[m];
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < roster.length - 1 ? "1px solid var(--border)" : "none" }}>
                <Avatar name={s.name} size={34} />
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{s.name}</div>
                <button onClick={() => setMarks({ ...marks, [s.id]: cycle[m] })} style={{ border: "none", cursor: "pointer", background: tn.bg, color: tn.fg, fontWeight: 700, fontSize: 12.5, padding: "7px 16px", borderRadius: 8, minWidth: 92 }}>{tn.t}</button>
              </div>
            );
          })}
        </Card>
      </div>
    );
  }

  function StaffGrades() {
    const roster = C.students.filter((s) => s.level === "B1").slice(0, 8);
    return (
      <div>
        <SectionHead title="Grades & feedback" sub="Record scores for your B1 Morning class." />
        <div className="grid-2-1">
          <Card pad={0}>
            <div style={{ padding: "18px 22px 6px" }}><h3 className="card-title">Class roster</h3></div>
            <Table
              columns={[{ key: "name", label: "Student" }, { key: "avgScore", label: "Current avg", align: "center" }, { key: "act", label: "", align: "right" }]}
              rows={roster}
              renderCell={(r, key) =>
                key === "name" ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={r.name} size={30} /><span style={{ fontWeight: 600 }}>{r.name}</span></div>
                : key === "avgScore" ? <span style={{ fontWeight: 800, color: r.avgScore >= 80 ? "#1a8a2a" : "#9a7822" }}>{r.avgScore}</span>
                : <button className="mini-btn">Add grade</button>}
            />
          </Card>
          <Card>
            <h3 className="card-title" style={{ marginBottom: 16 }}>Quick grade entry</h3>
            <div className="form-stack">
              <label className="fld"><span>Student</span><select>{roster.map((s) => <option key={s.id}>{s.name}</option>)}</select></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="fld"><span>Skill</span><select><option>Speaking</option><option>Writing</option><option>Reading</option><option>Listening</option></select></label>
                <label className="fld"><span>Score</span><input type="number" placeholder="80" /></label>
              </div>
              <label className="fld"><span>Comment</span><textarea rows="3" placeholder="Feedback for the student…"></textarea></label>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => window.toast("Grade saved")}>Save</button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function Assignments() {
    const items = [
      { title: "Essay — My future career", cls: "B1 Morning", due: "2026-06-05", submitted: 9, total: 14 },
      { title: "Listening quiz — Unit 7", cls: "B2 Business", due: "2026-06-03", submitted: 11, total: 11 },
      { title: "Speaking recording — Describe a place", cls: "B1 Morning", due: "2026-06-10", submitted: 4, total: 14 },
    ];
    return (
      <div>
        <SectionHead title="Assignments" sub="Set tasks and track submissions."
          action={<button className="btn-primary" onClick={() => window.toast("New assignment created")}><Icon name="plus" size={17} />New assignment</button>} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((a, i) => (
            <Card key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--green-wash)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="doc" size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{a.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{a.cls} · due {C.fmtDate(a.due)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: a.submitted === a.total ? "#1a8a2a" : "var(--ink)" }}>{a.submitted}/{a.total}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>submitted</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  window.STAFF = {
    user: { name: "Daniel Okonkwo", role: "Senior Instructor" },
    nav: [
      { id: "classes", label: "My classes", icon: "layers" },
      { id: "attendance", label: "Attendance", icon: "check" },
      { id: "grades", label: "Grades", icon: "award" },
      { id: "assignments", label: "Assignments", icon: "doc" },
    ],
    pages: { classes: MyClasses, attendance: StaffAttendance, grades: StaffGrades, assignments: Assignments },
  };
})();
