import { useQuery } from "@tanstack/react-query";

import { WallType } from "@/constants";
import axiosInstance from "@/lib/axios";

export const useMainPipeSizes = (wallType: WallType = WallType.SINGLE_WALL) => {
  return useQuery({
    queryKey: ["main_pipe_sizes", wallType],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `ms/dropdowns/main_pipe_sizes/?wall_type=${wallType}`
      );
      return response.data as [string, string][];
    },
  });
};
