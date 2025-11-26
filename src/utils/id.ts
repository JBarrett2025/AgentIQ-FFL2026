
export const generateUniqueId = (): string => `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
