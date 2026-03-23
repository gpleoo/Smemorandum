import { useEventContext } from '../context/EventContext';
import { Category } from '../models/types';

export function useCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useEventContext();

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find((c) => c.id === id);
  };

  const getCategoryColor = (id: string): string => {
    return getCategoryById(id)?.color ?? '#9CA3AF';
  };

  const getCategoryName = (id: string): string => {
    return getCategoryById(id)?.name ?? '';
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryColor,
    getCategoryName,
  };
}
