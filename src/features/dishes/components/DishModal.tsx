import { useState, useEffect } from "react";
import { X, Save, Loader2, Utensils, Euro, List } from "lucide-react";
import type { Dish } from "../../../types/Dish";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: Partial<Dish>) => Promise<void>;
  dish?: Dish | null;
}

export default function DishModal({ isOpen, onClose, onSave, dish }: DishModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Dish>>({
    name: "",
    price: 0,
    section: "Mains",
    description: "",
    active: true,
    availableAt: ["lunch", "dinner"],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dish) {
      setFormData({
        ...dish,
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        section: "Mains",
        description: "",
        active: true,
        availableAt: ["lunch", "dinner"],
      });
    }
  }, [dish, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving dish:", error);
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
                  <Utensils className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {dish ? t('dishes.editDish').toUpperCase() : t('dishes.addDish').toUpperCase()}
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('dishes.form.name')}</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder={t('dishes.form.namePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('dishes.form.price')} (€)</label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('dishes.form.section')}</label>
                  <div className="relative">
                    <List className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value as any })}
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
                    >
                      <option value="Starters">{t('dishes.sections.starters')}</option>
                      <option value="Mains">{t('dishes.sections.mains')}</option>
                      <option value="Desserts">{t('dishes.sections.desserts')}</option>
                      <option value="Drinks">{t('dishes.sections.drinks')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('dishes.details.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all h-24 resize-none"
                  placeholder={t('dishes.form.descriptionPlaceholder')}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
              >
                {t('navbar.back')}
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
                {t('dishes.form.submit').toUpperCase()}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

