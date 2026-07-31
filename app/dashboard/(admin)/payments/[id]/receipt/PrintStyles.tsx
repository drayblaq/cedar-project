"use client";

export default function PrintStyles() {
  return (
    <style>{`
      @media print {
        nav { display: none !important; }
        .no-print { display: none !important; }
        body { background: white; }
        body > * { visibility: hidden; }
        #receipt, #receipt * { visibility: visible; }
        #receipt {
          position: fixed;
          inset: 0;
          width: 100%;
          padding: 2rem;
          box-shadow: none;
          border: none;
          border-radius: 0;
        }
      }
    `}</style>
  );
}
