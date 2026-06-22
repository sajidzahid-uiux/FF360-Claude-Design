import type { AvailableMember, CrewDirectoryMember } from "@/api/types";

function mapCrewDirectoryMemberToAvailableMember(
  member: CrewDirectoryMember
): AvailableMember {
  const name = member.name;
  const [firstName, ...rest] = name.split(" ");

  return {
    id: member.id,
    user: {
      id: member.id,
      username: name,
      first_name: firstName || "",
      last_name: rest.join(" ") || "",
      profile_image: null,
    },
    role: member.role,
    role_display: member.role_display,
  };
}

export function mapCrewDirectoryMembersToAvailable(
  members: CrewDirectoryMember[]
): AvailableMember[] {
  return members.map(mapCrewDirectoryMemberToAvailableMember);
}
