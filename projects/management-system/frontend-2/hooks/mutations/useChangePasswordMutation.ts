import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { AuthService } from "@/api/services";

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: () => AuthService.requestPasswordChange(),
    onSuccess: (data) => {
      toast.success(
        data.message ||
          "Verification email sent. Check your inbox to set your new password."
      );
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Failed to send password change email. Please try again.";
      toast.error(message);
    },
  });
};
