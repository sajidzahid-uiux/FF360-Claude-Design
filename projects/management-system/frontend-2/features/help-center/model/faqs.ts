export type HelpFaqAnswer = string | "contact-support-cta";

export interface HelpFaqItem {
  question: string;
  answer: HelpFaqAnswer;
}

export const HELP_FAQ_ITEMS: HelpFaqItem[] = [
  {
    question: "Can a user belong to multiple organizations?",
    answer:
      "Yes, a user can belong to multiple organizations, where different roles may be applied to them.",
  },
  {
    question: "Can an organization have multiple admins?",
    answer: "Yes. One organization can contain multiple admins simultaneously.",
  },
  {
    question: "Does creating a new organization require a new subscription?",
    answer:
      "Yes. Each organization requires a subscription by the owner\\admin.",
  },
  {
    question: "Can admins control what other users see or do?",
    answer:
      "By assigning roles to the members of the organization, admins can control what other members see or have access to.",
  },
  {
    question: "What happens to my data if I leave an organization?",
    answer:
      "The data that are in an organization are preserved in the organization even after a member leaves the organization.",
  },
  {
    question: "Can I delete or archive an organization?",
    answer: "Yes, an organization can be deleted, though it can't be archived.",
  },
  {
    question: "How do I invite teammates to my organization?",
    answer:
      "After registering in the system, teammates are to be added to the organization by the administrator, and receive an invitation email with a link redirecting them to the organization.",
  },
  {
    question: "Can I transfer ownership of an organization to someone else?",
    answer:
      "By assigning another member as the admin of the organization, they have the authority to renew the subscription and assign roles.",
  },
  {
    question: "What actions trigger the notification system?",
    answer:
      "Actions that make critical and important changes to the system trigger the notification system.",
  },
  {
    question: "Who can use this platform?",
    answer:
      "This platform is to be used to manage and make the work of contractors in this domain easier and more flexible.",
  },
  {
    question: "How do I sign up?",
    answer:
      "By pressing the subscribe button, and choosing a plan,you can sign up in the system.",
  },
  {
    question: "Can I access the platform on mobile?",
    answer:
      "Yes, the web app is also accessible on mobile phones through browsing apps.",
  },
  {
    question: "Is there a free trial or demo?",
    answer:
      "Yes. Each plan starts with a monthly free trial that can be accessed by the subscribers. Also, the user can benefit from the free demo that is available here on the website.",
  },
  {
    question: "How can I contact support?",
    answer: "contact-support-cta",
  },
  {
    question: "Do I need technical knowledge to use the platform?",
    answer:
      "The platform is a user friendly platform that is easy to use and navigate by all types of users.",
  },
];

export const HELP_QUICK_LINKS = [
  { icon: "video", label: "Training Videos" },
  { icon: "book", label: "Training Tutorials" },
  { icon: "steps", label: "Action Steps" },
] as const;

export const FAQS_PER_PAGE = 5;
export const KNOWLEDGE_BASE_SECTIONS_PER_PAGE = 5;
