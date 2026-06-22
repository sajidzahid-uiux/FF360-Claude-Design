// Define the plan data type
export interface PlanData {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  yearlyDiscount?: number | null;
  perJobPrice: {
    monthly: string;
    yearly: string;
  };
  popular?: boolean;
  apiId: {
    monthly: string;
    yearly: string;
  };
  maxUsers: number | null;
  freeTrialDays: number | null;
}

export const plans: PlanData[] = [
  {
    id: "solo",
    name: "Solo",
    description: "Perfect for independent contractors",
    monthlyPrice: 78,
    yearlyPrice: 741,
    yearlyDiscount: 20,
    perJobPrice: {
      monthly: "",
      yearly: "",
    },
    apiId: {
      monthly: "solo_monthly",
      yearly: "solo_yearly",
    },
    maxUsers: 1,
    freeTrialDays: 14,
  },
  {
    id: "team",
    name: "Team",
    description: "Ideal for small businesses",
    monthlyPrice: 361,
    yearlyPrice: 3458,
    yearlyDiscount: 20,
    popular: true,
    perJobPrice: {
      monthly: "$72 Per user",
      yearly: "$692 Per user",
    },
    apiId: {
      monthly: "team_monthly",
      yearly: "team_yearly",
    },
    maxUsers: 5,
    freeTrialDays: 14,
  },
  {
    id: "business",
    name: "Growing Business",
    description: "For established businesses",
    monthlyPrice: 669,
    yearlyPrice: 6421,
    yearlyDiscount: 20,
    perJobPrice: {
      monthly: "$67 Per user",
      yearly: "$642 Per user",
    },
    apiId: {
      monthly: "business_monthly",
      yearly: "business_yearly",
    },
    maxUsers: 10,
    freeTrialDays: 14,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for larger teams",
    monthlyPrice: null,
    yearlyPrice: null,
    perJobPrice: {
      monthly: "Let's talk",
      yearly: "Let's talk",
    },
    apiId: {
      monthly: "enterprise",
      yearly: "enterprise",
    },
    maxUsers: null,
    freeTrialDays: null,
  },
  {
    id: "enterprise_yearly",
    name: "Enterprise Yearly",
    description: "",
    monthlyPrice: null,
    yearlyPrice: null,
    perJobPrice: {
      monthly: "",
      yearly: "",
    },
    apiId: {
      monthly: "enterprise_yearly",
      yearly: "enterprise_yearly",
    },
    maxUsers: null,
    freeTrialDays: null,
  },
];

// Helper function to get plan by API ID
export function getPlanByApiId(apiId: string): PlanData | undefined {
  return plans.find(
    (plan) => plan.apiId.monthly === apiId || plan.apiId.yearly === apiId
  );
}

// Helper function to determine if a plan is yearly
export function isYearlyPlan(apiId: string): boolean {
  return apiId.includes("yearly");
}

// Helper function to get plan by ID
export function getPlanById(id: string): PlanData | undefined {
  return plans.find((plan) => plan.id === id);
}

// Helper function to determine billing cycle from API ID
export function getBillingCycle(apiId: string): "monthly" | "yearly" {
  return apiId.includes("yearly") ? "yearly" : "monthly";
}

export function getPlanName(apiId: string): string {
  return (
    plans.find(
      (plan) => plan.apiId.monthly === apiId || plan.apiId.yearly === apiId
    )?.name || ""
  );
}
