import { useState, useEffect } from "react";
import { X, Save, Loader2, Trophy, Star, MessageSquare } from "lucide-react";
import { Reward } from "../types/Reward";
import { motion, AnimatePresence } from "framer-motion";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reward: Partial<Reward>) => Promise<void>;
  reward?: Reward | null;
}

export default function RewardModal({ isOpen, onClose, onSave, reward }: RewardModalProps) {
  const [formData, setFormData] = useState<Partial<Reward>>({
    name: "",
    description: "",
    pointsRequired: 0,
    active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reward) {
      setFormData({
        ...reward,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        pointsRequired: 0,
        active: true,
      });
    }
  }, [reward, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving reward:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Trophy className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {reward ? "EDITAR PREMIO" : "NUEVA RECOMPENSA"}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre de la Recompensa</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="Ej: Postre Gratis"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Puntos Necesarios</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    required
                    type="number"
                    value={formData.pointsRequired}
                    onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) })}
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción del Beneficio</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all h-24 resize-none"
                  placeholder="Explica qué obtendrá el cliente..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="active" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  Recompensa activa y disponible para canje
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                GUARDAR RECOMPENSA
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
