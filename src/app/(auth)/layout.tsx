export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen overflow-hidden grid md:grid-cols-[55%_45%] bg-off">
      {/* LEFT */}
      <div
        className="relative flex flex-col justify-between overflow-hidden"
        style={{ background: "#C41230", padding: "52px 60px" }}
      >
        <div className="absolute pointer-events-none rounded-full" style={{ width: 560, height: 560, border: "90px solid rgba(255,255,255,0.06)", bottom: -180, left: -160 }} />
        <div className="absolute pointer-events-none rounded-full" style={{ width: 200, height: 200, border: "36px solid rgba(255,255,255,0.05)", top: -50, right: 40 }} />

        <span className="font-display text-[0.95rem] tracking-[5px] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
          DailyFit
        </span>

        <div className="relative z-10 ml-12">
          <h1 className="font-display leading-[0.88] text-white uppercase" style={{ fontSize: "clamp(5rem,9.5vw,8rem)", fontWeight: 900 }}>
            <div>Latih.</div>
            <div style={{ color: "rgba(255,255,255,0.22)" }}>Catat.</div>
            <div>Ulangi.</div>
          </h1>
          <p className="mt-7 text-[0.92rem] leading-[1.7] max-w-[300px]" style={{ color: "rgba(255,255,255,0.58)" }}>
            Tracker &amp; planner home workout yang sepenuhnya milikmu — kamu yang atur, kamu yang kontrol.
          </p>
        </div>

        <span className="relative z-10 text-[0.7rem]" style={{ color: "rgba(255,255,255,0.22)" }}>
          © 2026 DailyFit
        </span>
      </div>

      {/* RIGHT */}
      <div className="relative flex flex-col justify-center overflow-hidden border-l" style={{ background: "#F6F4F1", borderColor: "rgba(0,0,0,0.06)", padding: "52px 64px" }}>
        <div className="absolute font-display pointer-events-none select-none leading-none" style={{ fontSize: "18rem", color: "rgba(196,18,48,0.045)", right: -30, bottom: -20, fontWeight: 900, letterSpacing: "-6px" }}>
          DF
        </div>
        <div className="relative z-10 max-w-[300px]">
          {children}
        </div>
      </div>
    </div>
  );
}
