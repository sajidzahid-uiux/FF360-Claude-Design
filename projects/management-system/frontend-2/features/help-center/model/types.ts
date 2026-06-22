export interface KnowledgeBaseItem {
  title: string;
  images: string[];
}

export interface KnowledgeBaseSection {
  section: string;
  items: KnowledgeBaseItem[];
}

export type SupportTicketSubject =
  | "technical"
  | "account"
  | "training"
  | "other";

export interface SupportTicketPayload {
  name: string;
  email: string;
  subject: SupportTicketSubject;
  message: string;
}

export interface SupportTicketFormValues {
  name: string;
  email: string;
  subject: SupportTicketSubject | "";
  message: string;
}
