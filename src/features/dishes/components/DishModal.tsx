import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  Utensils,
  Euro,
  List,
  Image,
  Scale,
  ChefHat,
  AlertCircle,
  Heart,
  Flame,
  Clock,
  Check,
} from 'lucide-react';
import type { Dish } from '../../../types/Dish';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: Partial<Dish>) => Promise<void>;
  dish?: Dish | null;
}

const ALLERGEN_OPTIONS = [
  'gluten',
  'shellfish',
  'nuts',
  'dairy',
  'eggs',
  'soy',
  'fish',
  'sesame',
  'mustard',
  'celery',
  'lupins',
  'molluscs',
  'sulphites',
];
const DIETARY_OPTIONS = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'halal',
  'kosher',
  'dairy-free',
  'nut-free',
];
const FLAVOR_OPTIONS = [
  'spicy',
  'mild',
  'sweet',
  'sour',
  'salty',
  'bitter',
  'umami',
  'smoky',
  'rich',
  'light',
  'creamy',
  'tangy',
  'fresh',
  'hearty',
  'nutty',
];
const AVAILABILITY_OPTIONS = ['breakfast', 'brunch', 'lunch', 'happy-hour', 'dinner', 'all-day'];

export default function DishModal({ isOpen, onClose, onSave, dish }: DishModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Dish>>({
    name: '',
    price: 0,
    section: 'Mains',
    description: '',
    active: true,
    images: [],
    portionSize: 'medium',
    ingredients: [],
    allergens: [],
    dietaryFlags: [],
    flavorProfile: [],
    availableAt: ['lunch', 'dinner'],
  });
  const [loading, setLoading] = useState(false);

  // Helper for text-to-array inputs
  const [textInputs, setTextInputs] = useState({
    images: '',
    ingredients: '',
  });

  useEffect(() => {
    if (dish) {
      setFormData({ ...dish });
      setTextInputs({
        images: dish.images?.join(', ') || '',
        ingredients: dish.ingredients?.join(', ') || '',
      });
    } else {
      const defaultState = {
        name: '',
        price: 0,
        section: 'Mains' as const,
        description: '',
        active: true,
        images: [],
        portionSize: 'medium' as const,
        ingredients: [],
        allergens: [],
        dietaryFlags: [],
        flavorProfile: [],
        availableAt: ['lunch', 'dinner'],
      };
      setFormData(defaultState);
      setTextInputs({
        images: '',
        ingredients: '',
      });
    }
  }, [dish, isOpen]);

  const handleTextToArray = (field: 'images' | 'ingredients', value: string) => {
    setTextInputs((prev) => ({ ...prev, [field]: value }));
    const arrayValue = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, [field]: arrayValue }));
  };

  const toggleEnumItem = (field: keyof Dish, item: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving dish:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const TagSelector = ({
    label,
    icon: Icon,
    options,
    selectedItems,
    onToggle,
    colorClass,
  }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 border border-gray-100 rounded-2xl min-h-[4rem]">
        {options.map((option: string) => {
          const isSelected = selectedItems.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? `${colorClass} border-transparent shadow-sm scale-105`
                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              {option.replace('-', ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 sm:p-8 text-white shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl shadow-inner">
                  <Utensils className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase">
                  {dish ? t('dishes.editDish') : t('dishes.addDish')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10 scrollbar-hide"
          >
            {/* Grid Layout for Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {t('dishes.form.basicInfo', 'Información básica')}
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {t('dishes.form.name')}
                      </label>
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
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          {t('dishes.form.price')} (€)
                        </label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            required
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({ ...formData, price: parseFloat(e.target.value) })
                            }
                            className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          {t('dishes.form.section')}
                        </label>
                        <div className="relative">
                          <List className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <select
                            value={formData.section}
                            onChange={(e) =>
                              setFormData({ ...formData, section: e.target.value as any })
                            }
                            className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
                          >
                            <option value="Starters">{t('dishes.sections.starters')}</option>
                            <option value="Mains">{t('dishes.sections.mains')}</option>
                            <option value="Desserts">{t('dishes.sections.desserts')}</option>
                            <option value="Drinks">{t('dishes.sections.drinks')}</option>
                            <option value="Sides">Sides</option>
                            <option value="Specials">Specials</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {t('dishes.form.image')}
                      </label>
                      <div className="relative">
                        <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          value={textInputs.images}
                          onChange={(e) => handleTextToArray('images', e.target.value)}
                          className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                          placeholder={t('dishes.form.imagePlaceholder')}
                        />
                      </div>
                      {formData.images?.[0] && (
                        <div className="mt-3 relative w-full h-32 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                          <img
                            src={formData.images[0]}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {t('dishes.form.portionSize')}
                      </label>
                      <div className="relative">
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <select
                          value={formData.portionSize}
                          onChange={(e) =>
                            setFormData({ ...formData, portionSize: e.target.value as any })
                          }
                          className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
                        >
                          <option value="small">{t('dishes.portionSizes.small')}</option>
                          <option value="medium">{t('dishes.portionSizes.medium')}</option>
                          <option value="large">{t('dishes.portionSizes.large')}</option>
                          <option value="sharing">{t('dishes.portionSizes.sharing')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {t('dishes.form.ingredients')}
                      </label>
                      <div className="relative">
                        <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          value={textInputs.ingredients}
                          onChange={(e) => handleTextToArray('ingredients', e.target.value)}
                          className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                          placeholder={t('dishes.form.ingredientsPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {t('dishes.details.description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all h-32 resize-none shadow-inner"
                    placeholder={t('dishes.form.descriptionPlaceholder')}
                  />
                </div>
              </div>

              {/* Right Column: Tags and Enums */}
              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {t('dishes.form.attributes', 'Atributos y Clasificación')}
                </h3>

                <div className="space-y-6">
                  <TagSelector
                    label={t('dishes.form.availability')}
                    icon={Clock}
                    options={AVAILABILITY_OPTIONS}
                    selectedItems={formData.availableAt || []}
                    onToggle={(item: string) => toggleEnumItem('availableAt', item)}
                    colorClass="bg-blue-500 text-white"
                  />

                  <TagSelector
                    label={t('dishes.form.dietary')}
                    icon={Heart}
                    options={DIETARY_OPTIONS}
                    selectedItems={formData.dietaryFlags || []}
                    onToggle={(item: string) => toggleEnumItem('dietaryFlags', item)}
                    colorClass="bg-green-500 text-white"
                  />

                  <TagSelector
                    label={t('dishes.form.flavor')}
                    icon={Flame}
                    options={FLAVOR_OPTIONS}
                    selectedItems={formData.flavorProfile || []}
                    onToggle={(item: string) => toggleEnumItem('flavorProfile', item)}
                    colorClass="bg-orange-500 text-white"
                  />

                  <TagSelector
                    label={t('dishes.form.allergens')}
                    icon={AlertCircle}
                    options={ALLERGEN_OPTIONS}
                    selectedItems={formData.allergens || []}
                    onToggle={(item: string) => toggleEnumItem('allergens', item)}
                    colorClass="bg-red-500 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="pt-8 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-md pb-2 z-10">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 rounded-xl text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                {t('navbar.back')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-orange-500 text-white rounded-[1.25rem] font-black shadow-xl shadow-orange-200 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span className="tracking-widest">{t('dishes.form.submit').toUpperCase()}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
