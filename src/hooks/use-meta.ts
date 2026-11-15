import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/features/public/api';

/** Option lists (permissions, languages, employment types...) always come from the API. */
export function useMeta() {
  return useQuery({ queryKey: ['meta'], queryFn: publicApi.meta, staleTime: Infinity });
}
