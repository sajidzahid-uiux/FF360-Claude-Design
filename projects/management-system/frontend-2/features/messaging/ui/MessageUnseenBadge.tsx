import { FC } from "react";

interface MessageUnseenBadgeProps {
  count: number;
}

const MessageUnseenBadge: FC<MessageUnseenBadgeProps> = ({ count }) => {
  if (!count || count <= 0) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: 8,
        border: "2px solid var(--primary)", // neutral-200
        background: "var(--primary)",
        color: "#fff",
        fontWeight: 500,
        fontSize: 12,
        boxSizing: "border-box",
        padding: "0 8px",
      }}
    >
      {count}
    </span>
  );
};

export default MessageUnseenBadge;
