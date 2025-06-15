
import { useSupabaseData } from './use-supabase-data';

// Re-export the Supabase data hook with the same interface
// This maintains backward compatibility with existing components
export const useStoreData = useSupabaseData;
