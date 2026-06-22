/**
 * Repair Lead ShowMoreCard Wrapper
 * Auto-configured using the wrapper factory
 */
import { JobType, ResourceType } from "@/constants";
import { createShowMoreCardWrapper } from "@/features/job-lead/ui/show-more-card/exports";

export default createShowMoreCardWrapper(ResourceType.LEAD, JobType.REPAIR);
