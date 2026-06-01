/* Cedar — Student portal pages. Exports window.STUDENT */
(function () {
  const C = window.CEDAR;
  const { Icon, Card, StatCard, SectionHead, Table, Badge, LevelPill, Ring, LineChart, Note } = window;
  const me = C.students.find((s) => s.name === "Chimène Adjovi");
  const myGrades = C.grades.filter((g) => g.student === me.name);

  function levelTrack(current) {
    const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const idx = order.indexOf(current);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {order.map((l, i) => (
          <React.Fragment key={l}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 800,
                background: i <= idx ? "var(--green)" : "var(--green-wash)", color: i <= idx ? "#fff" : "var(--muted)",
                border: i === idx ? "3px solid var(--green-soft)" : "none", boxShadow: i === idx ? "0 0 0 3px var(--green)" : "none" }}>{l}</div>
            </div>
            {i < order.length - 1 && <div style={{ flex: 1, height: 3, background: i < idx ? "var(--green)" : "var(--border)", borderRadius: 3, minWidth: 14 }}></div>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  function Progress() {
    return (
      <div>
        <SectionHead title="Hello, Chimène 👋" sub="You're making steady progress in General English." />
        <Card style={{ marginBottom: 18, background: "linear-gradient(120deg, var(--green-deep), #15561a)", border: "none", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green-bright)", marginBottom: 8 }}>Current level</div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.12, whiteSpace: "nowrap" }}>B1 · Intermediate</div>
              <div style={{ fontSize: 13.5, opacity: .8, marginTop: 10 }}>General English · enrolled Sept 2025</div>
            </div>
            <div style={{ flex: "1 1 300px", minWidth: 240 }}>{levelTrack("B1")}</div>
          </div>
        </Card>
        <div className="grid-stats-3">
          <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Ring value={me.attendance} size={92} stroke={9} label="attendance" />
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Attendance</div><div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>Great consistency this term.</div></div>
          </Card>
          <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Ring value={me.avgScore} size={92} stroke={9} label="avg score" color="#bf9636" />
            <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Average score</div><div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>Across all skills.</div></div>
          </Card>
          <StatCard icon="wallet" label="Fees status" value="Settled" sub="No balance due" tone="green" />
        </div>
        <div className="grid-2-1" style={{ marginTop: 18 }}>
          <Card>
            <h3 className="card-title">Score progression</h3>
            <p className="card-sub" style={{ marginBottom: 4 }}>Average score by term</p>
            <LineChart data={C.progressSeries} valueKey="score" labelKey="term" height={200} />
          </Card>
          <Card>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Upcoming</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {C.events.slice(0, 4).map((e) => (
                <div key={e.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 42, textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{e.date.split("-")[2]}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Jun</div>
                  </div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{e.title}</div></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function MyGrades() {
    return (
      <div>
        <SectionHead title="My grades" sub="Your scores and teacher feedback by skill." />
        <div className="grid-stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {["Speaking", "Writing", "Reading", "Listening"].map((sk, i) => {
            const v = [84, 79, 81, 86][i];
            return <Card key={sk} pad={18} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: v >= 85 ? "#1a8a2a" : "var(--ink)", letterSpacing: "-0.02em" }}>{v}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginTop: 4 }}>{sk}</div>
            </Card>;
          })}
        </div>
        <Card pad={0} style={{ marginTop: 18 }}>
          <div style={{ padding: "18px 22px 6px" }}><h3 className="card-title">Grade history</h3></div>
          <Table
            columns={[{ key: "subject", label: "Skill" }, { key: "term", label: "Term" }, { key: "score", label: "Score", align: "center" }, { key: "remark", label: "Teacher remark" }, { key: "date", label: "Date" }]}
            rows={[...myGrades, { subject: "Reading", term: "Term 1", score: 76, remark: "Improving steadily", date: "2026-02-18" }, { subject: "Listening", term: "Term 1", score: 80, remark: "Strong", date: "2026-02-12" }]}
            renderCell={(r, key) =>
              key === "score" ? <span style={{ fontWeight: 800, color: r.score >= 85 ? "#1a8a2a" : r.score >= 70 ? "#9a7822" : "#b3402f" }}>{r.score}</span>
              : key === "remark" ? <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{r.remark}</span>
              : key === "date" ? <span style={{ color: "var(--muted)" }}>{C.fmtDate(r.date)}</span>
              : <span style={{ fontWeight: key === "subject" ? 600 : 400 }}>{r[key]}</span>}
          />
        </Card>
      </div>
    );
  }

  function MyAttendance() {
    const present = C.attendanceLog.filter((a) => a.status === "present").length;
    const tone = { present: "green", absent: "red", late: "gold" };
    return (
      <div>
        <SectionHead title="My attendance" sub="Your class attendance record this term." />
        <div className="grid-2-1">
          <Card style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Ring value={me.attendance} size={130} stroke={12} label="present" />
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Excellent attendance</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, maxWidth: 280 }}>You've attended {present} of your last {C.attendanceLog.length} sessions. Keep it above 80% to stay on track for B2.</p>
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

  function StudentAnnouncements() {
    return (
      <div>
        <SectionHead title="Announcements" sub="News and notices from Cedar Training Center." />
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

  function StudentCalendar() {
    const typeColor = { exam: "#3f7d8c", holiday: "#b3402f", event: "#d4a843", term: "#2ea82a" };
    return (
      <div>
        <SectionHead title="Academic calendar" sub="Key dates for Term 3 · June 2026." />
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {C.events.map((e, i) => (
              <div key={e.id} style={{ display: "flex", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: i < C.events.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 52, textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{e.date.split("-")[2]}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>June</div>
                </div>
                <div style={{ width: 3, alignSelf: "stretch", borderRadius: 3, background: typeColor[e.type] }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{e.title}</div>
                  <div style={{ marginTop: 4 }}><Badge tone={e.type === "exam" ? "blue" : e.type === "holiday" ? "red" : e.type === "term" ? "green" : "gold"}>{e.type}</Badge></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  window.STUDENT = {
    user: { name: "Chimène Adjovi", role: "Student · B1" },
    nav: [
      { id: "progress", label: "My progress", icon: "trend" },
      { id: "grades", label: "Grades", icon: "award" },
      { id: "attendance", label: "Attendance", icon: "check" },
      { id: "announcements", label: "Announcements", icon: "megaphone" },
      { id: "calendar", label: "Calendar", icon: "calendar" },
    ],
    pages: { progress: Progress, grades: MyGrades, attendance: MyAttendance, announcements: StudentAnnouncements, calendar: StudentCalendar },
  };
})();
