import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PageLoader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="loader-racket text-gold">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
                <ellipse cx="30" cy="22" rx="20" ry="20" stroke="currentColor" strokeWidth="2.5" />
                <line x1="30" y1="42" x2="30" y2="78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M14 22 L46 22 M14 14 L46 14 M14 30 L46 30 M22 6 L22 38 M30 4 L30 40 M38 6 L38 38" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
              </svg>
            </div>
            <div className="font-display text-2xl tracking-[0.3em] text-gold">JAGA</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}