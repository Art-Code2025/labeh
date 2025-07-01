// Creating new file 

export const slugToNameMap: Record<string, string> = {
  internal_delivery: 'التوصيل والمشاوير الداخلية',
  external_trips: 'المشاوير الخارجية',
  home_maintenance: 'الصيانة المنزلية',
};

export const getArabicCategoryName = (slug: string): string | undefined => slugToNameMap[slug];

export const getCategorySlug = (arabicName: string): string | undefined => {
  const entries = Object.entries(slugToNameMap);
  for (const [slug, name] of entries) {
    if (arabicName.trim() === name.trim()) return slug;
  }
  // fallback – simple contains checks
  if (arabicName.includes('الخارجية')) return 'external_trips';
  if (arabicName.includes('داخلية')) return 'internal_delivery';
  if (arabicName.includes('الصيانة')) return 'home_maintenance';
  return undefined;
}; 