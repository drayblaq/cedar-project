/* Cedar — line icon set. Simple stroke icons (functional UI). Exports window.Icon */
(function () {
  const P = {
    grid:        "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    users:       "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    wallet:      "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2 M3 7h18v10H3z M16 12h.01",
    check:       "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    chart:       "M3 3v18h18 M7 14l3-4 4 3 5-7",
    award:       "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 13.5L7 22l5-3 5 3-1.5-8.5",
    megaphone:   "M3 11l15-6v14L3 13v-2z M3 11v2a3 3 0 0 0 3 3h1 M11 19l-1.5 2",
    calendar:    "M3 4h18v18H3zM3 9h18 M8 2v4 M16 2v4",
    book:        "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z",
    settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 15 4.6l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
    logout:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    bell:        "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0",
    search:      "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
    chevronD:    "M6 9l6 6 6-6",
    chevronR:    "M9 6l6 6-6 6",
    arrowR:      "M5 12h14 M12 5l7 7-7 7",
    plus:        "M12 5v14 M5 12h14",
    clock:       "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
    pin:         "M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    phone:       "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z",
    mail:        "M4 4h16v16H4z M22 6l-10 7L2 6",
    doc:         "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6",
    download:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    trend:       "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    home:        "M3 10.5L12 3l9 7.5 M5 9.5V21h14V9.5",
    layers:      "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    user:        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    heart:       "M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z",
    menu:        "M3 6h18 M3 12h18 M3 18h18",
    x:           "M18 6L6 18 M6 6l12 12",
    star:        "M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.4 3.3L7 14.3 2 9.4l7-.9z",
    filter:      "M22 3H2l8 9.5V19l4 2v-8.5z",
    sparkles:    "M12 3l1.9 4.8L19 9.6l-4.8 1.9L12 16l-1.9-4.5L5 9.6l4.8-1.8z M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z",
  };

  function Icon({ name, size = 20, stroke = 2, className = "", style = {} }) {
    const d = P[name];
    if (!d) return null;
    const paths = d.split(" M").map((seg, i) => (i === 0 ? seg : "M" + seg));
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
           strokeLinejoin="round" className={className} style={style} aria-hidden="true">
        {paths.map((pd, i) => <path key={i} d={pd} />)}
      </svg>
    );
  }

  window.Icon = Icon;
})();
