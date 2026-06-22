import { API_URL } from "@/constants";

interface AvatarLikeUser {
  profile_image?: string | null;
}

interface AvatarLikeMember {
  avatar?: string | null;
  user?: AvatarLikeUser | null;
}

export function getInitials(
  name: string | undefined | null,
  email?: string | null
) {
  if (name && name.trim().length > 0) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (email) return email[0]?.toUpperCase() || "U";
  return "U";
}

export function resolveAvatarUrl(member: AvatarLikeMember): string | undefined {
  let url = member.user?.profile_image || member.avatar || undefined;
  if (!url) return undefined;
  url = url.startsWith("/") ? url.slice(1) : url;
  url = url.endsWith("/") ? url.slice(0, -1) : url;
  if (!url.includes("http")) {
    url = `${API_URL}${url}`;
  }
  return url;
}
