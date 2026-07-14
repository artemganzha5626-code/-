'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

type Phase = 'idle' | 'running' | 'inside';

/** Кав’ярня КАВОВА у 2D — будиночок із дверима, куди забігає маскот. */
function Cafe() {
  return (
    <svg viewBox="0 0 150 150" className="h-full w-full" fill="none">
      {/* стіна */}
      <rect x="14" y="40" width="122" height="98" rx="8" fill="#F7F2EA" />
      <rect x="14" y="40" width="122" height="98" rx="8" stroke="#8A5632" strokeWidth="2.5" />
      {/* маркіза */}
      <path d="M8 40h134l-6 16H14L8 40Z" fill="#C6813C" />
      <path d="M22 40l-3 16M42 40l-3 16M62 40l-3 16M82 40l-3 16M102 40l-3 16M122 40l-3 16" stroke="#F7F2EA" strokeWidth="6" opacity="0.85" />
      <path d="M14 56c6 6 12 6 18 0s12 6 18 0 12 6 18 0 12 6 18 0 12 6 18 0 12 6 18 0" stroke="#8A5632" strokeWidth="2" fill="none" />
      {/* вивіска */}
      <rect x="40" y="20" width="70" height="16" rx="4" fill="#2A2622" />
      <text x="75" y="32" textAnchor="middle" fill="#F3D9A6" fontSize="10" fontWeight="700" letterSpacing="1.5" fontFamily="Montserrat, sans-serif">КАВОВА</text>
      {/* вікно з теплим світлом */}
      <rect x="82" y="66" width="42" height="40" rx="4" fill="#F3D9A6" />
      <rect x="82" y="66" width="42" height="40" rx="4" stroke="#8A5632" strokeWidth="2" />
      <path d="M103 66v40M82 86h42" stroke="#8A5632" strokeWidth="1.5" opacity="0.6" />
      {/* парочка чашок на підвіконні */}
      <path d="M90 96h8v3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-3Z" fill="#8A5632" />
      <path d="M110 96h8v3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-3Z" fill="#8A5632" />
      {/* двері (сюди забігає маскот) */}
      <rect x="26" y="72" width="42" height="66" rx="4" fill="#5B3B22" />
      <rect x="26" y="72" width="42" height="66" rx="4" stroke="#8A5632" strokeWidth="2.5" />
      <rect x="31" y="78" width="14" height="24" rx="2" fill="#7a5433" />
      <rect x="49" y="78" width="14" height="24" rx="2" fill="#7a5433" />
      <circle cx="61" cy="110" r="2.4" fill="#F3D9A6" />
      {/* табличка «Відчинено» */}
      <rect x="30" y="112" width="26" height="10" rx="2" fill="#F7F2EA" />
      <text x="43" y="120" textAnchor="middle" fill="#C6813C" fontSize="6" fontWeight="700" fontFamily="Montserrat, sans-serif">ВІДЧИНЕНО</text>
      {/* димок із чашки над дахом */}
      <path d="M120 30c-2 2 2 3 0 5M126 28c-2 2 2 3 0 5" stroke="#DDA45B" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/** Мультяшний бариста-чоловічок. */
function Person({ phase }: { phase: Phase }) {
  return (
    <svg viewBox="0 0 60 96" className="h-full w-full overflow-visible" fill="none">
      <g className="mascot-body">
        {/* рука, що махає (лише в спокої) */}
        {phase === 'idle' && (
          <rect className="mascot-arm-wave" x="7" y="40" width="7" height="20" rx="3.5" fill="#EFC08A" />
        )}
        {/* ноги */}
        <g>
          <rect className="mascot-leg-a" x="23" y="70" width="7" height="20" rx="3.5" fill="#3B2E25" />
          <rect className="mascot-leg-b" x="31" y="70" width="7" height="20" rx="3.5" fill="#3B2E25" />
        </g>
        {/* тіло / фартух */}
        <path d="M18 44c0-5 5-8 12-8s12 3 12 8v22a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V44Z" fill="#C6813C" />
        <path d="M24 40h12l-1 8h-10l-1-8Z" fill="#F7F2EA" />
        {/* друга рука */}
        <rect x="42" y="42" width="7" height="20" rx="3.5" fill="#EFC08A" />
        {/* голова */}
        <circle cx="30" cy="22" r="14" fill="#EFC08A" />
        {/* волосся-шапочка */}
        <path d="M16 20a14 14 0 0 1 28 0c-4-3-9-4-14-4s-10 1-14 4Z" fill="#5B3B22" />
        {/* обличчя */}
        <circle cx="25" cy="23" r="2.3" fill="#2A2622" />
        <circle cx="35" cy="23" r="2.3" fill="#2A2622" />
        <circle cx="25.7" cy="22.2" r="0.8" fill="#fff" />
        <circle cx="35.7" cy="22.2" r="0.8" fill="#fff" />
        <path d="M25 29c2.6 2.6 7.4 2.6 10 0" stroke="#2A2622" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="20" cy="27" rx="2.6" ry="1.7" fill="#E0A55E" opacity="0.85" />
        <ellipse cx="40" cy="27" rx="2.6" ry="1.7" fill="#E0A55E" opacity="0.85" />
      </g>
    </svg>
  );
}

export function MascotScene() {
  const [phase, setPhase] = useState<Phase>('idle');
  const sceneRef = useRef<HTMLDivElement>(null);
  const [runX, setRunX] = useState(0);
  const reduced = usePrefersReducedMotion();

  const run = () => {
    if (phase !== 'idle') return;
    const w = sceneRef.current?.clientWidth ?? 320;
    setRunX(w * 0.46);
    setPhase('running');
  };

  const replay = () => setPhase('idle');

  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-terracotta-soft">
        Ласкаво просимо
      </p>

      <div
        ref={sceneRef}
        className="relative mt-4 flex-1 overflow-hidden rounded-2xl"
        style={{
          minHeight: 300,
          background:
            'linear-gradient(180deg, #3a2c20 0%, #2f2620 60%, #241d18 100%)',
        }}
      >
        {/* зорі / боке */}
        <span className="pointer-events-none absolute left-6 top-6 h-1 w-1 rounded-full bg-honey/60" />
        <span className="pointer-events-none absolute left-16 top-12 h-1.5 w-1.5 rounded-full bg-honey/40" />
        <span className="pointer-events-none absolute right-10 top-8 h-1 w-1 rounded-full bg-honey/50" />

        {/* земля */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[#1c1712]" />
        <div className="absolute inset-x-0 bottom-16 h-px bg-honey/15" />

        {/* кав’ярня */}
        <div className="absolute bottom-9 right-2 h-44 w-44 sm:right-3">
          <button
            type="button"
            onClick={phase === 'inside' ? replay : undefined}
            className={phase === 'inside' ? 'h-full w-full cursor-pointer' : 'h-full w-full'}
            aria-label={phase === 'inside' ? 'Показати ще раз' : 'Кав’ярня КАВОВА'}
          >
            <Cafe />
          </button>
        </div>

        {/* маскот */}
        <motion.button
          type="button"
          onClick={run}
          initial={false}
          animate={{
            x: phase === 'idle' ? 0 : runX,
            opacity: phase === 'inside' ? 0 : 1,
            scale: phase === 'inside' ? 0.7 : 1,
          }}
          transition={{
            x: { duration: reduced ? 0 : 1.15, ease: 'easeInOut' },
            opacity: { duration: reduced ? 0 : 0.3, delay: phase === 'inside' ? 0.05 : 0 },
            scale: { duration: reduced ? 0 : 0.3 },
          }}
          onAnimationComplete={() => {
            if (phase === 'running') setPhase('inside');
          }}
          className={`absolute bottom-[52px] left-4 h-28 w-20 cursor-pointer ${
            phase === 'running' ? 'mascot-running' : phase === 'idle' ? 'mascot-idle' : ''
          }`}
          aria-label="Клікни на мене"
        >
          <Person phase={phase} />
        </motion.button>

        {/* репліка маскота (в спокої) */}
        <AnimatePresence>
          {phase === 'idle' && (
            <motion.div
              key="idle-bubble"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="absolute left-3 top-6"
            >
              <div className="relative rounded-2xl bg-cream px-4 py-2 text-sm font-semibold text-espresso shadow-soft">
                Клікни на мене 👆
                <span className="absolute -bottom-1.5 left-8 h-3 w-3 rotate-45 bg-cream" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* репліка з кав’ярні (коли маскот усередині) */}
        <AnimatePresence>
          {phase === 'inside' && (
            <motion.div
              key="inside-bubble"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="absolute right-6 top-4"
            >
              <div className="relative rounded-2xl bg-terracotta px-4 py-2 text-sm font-semibold text-cream shadow-soft">
                Завітай до мене! ☕
                <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 bg-terracotta" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* підказка «ще раз» */}
        {phase === 'inside' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-2 left-0 right-0 text-center text-[11px] text-cream/45"
          >
            Натисніть на кав’ярню, щоб повторити ↺
          </motion.p>
        )}
      </div>
    </div>
  );
}
