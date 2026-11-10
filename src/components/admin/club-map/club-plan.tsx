const ROOM_CLASS =
  "absolute rounded-xl border border-zinc-700/60 bg-zinc-900/20 p-2 text-zinc-500 text-xs font-medium";

export function ClubPlan() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 size-full overflow-visible">
        <path
          d="M 10 330 H 200 V 290 H 700 V 350 H 990 V 420 H 970 V 370 H 220 V 350 H 10 Z"
          fill="rgba(39, 39, 42, 0.25)"
          stroke="rgba(113, 113, 122, 0.4)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
      </svg>

      <div className={`${ROOM_CLASS} left-[70px] top-[70px] h-[110px] w-[160px]`}>
        VIP 2
      </div>

      <div className={`${ROOM_CLASS} left-[240px] top-[70px] h-[220px] w-[350px]`}>
        Общий зал
      </div>

      <div className={`${ROOM_CLASS} left-[250px] top-[370px] h-[110px] w-[140px]`}>
        VIP 1
      </div>
      <div className={`${ROOM_CLASS} left-[400px] top-[370px] h-[110px] w-[140px]`}>
        VIP 3
      </div>
      <div className={`${ROOM_CLASS} left-[550px] top-[370px] h-[110px] w-[140px]`}>
        VIP 4
      </div>
      <div className={`${ROOM_CLASS} left-[850px] top-[370px] h-[110px] w-[140px]`}>
        VIP 5
      </div>
    </div>
  );
}
