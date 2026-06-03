import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  const phone = "919876543210";
  const msg = encodeURIComponent("Hi Jaga Traders! I'd like to know more about your badminton gear.");
  return (
    <motion.a
      href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:shadow-2xl transition-shadow"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <MessageCircle className="w-7 h-7 relative" fill="currentColor" />
    </motion.a>
  );
}