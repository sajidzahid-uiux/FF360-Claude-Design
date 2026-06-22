import type { QueryClient } from "@tanstack/react-query";

import { JobType } from "@/constants";
import { QUERY_KEYS } from "@/constants/enums";

export async function invalidateJobEquipmentQueries(
  queryClient: QueryClient,
  jobId: number,
  jobType: JobType
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB, jobId] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS, jobType] }),
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT] }),
    queryClient.invalidateQueries({ queryKey: ["job", jobType] }),
    queryClient.invalidateQueries({ queryKey: ["equipment"] }),
  ]);
}
