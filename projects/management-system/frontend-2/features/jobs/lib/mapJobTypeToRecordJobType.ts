import { JobType } from "@/constants";
import {
  type JobLeadTypeSegment,
  jobTypeToRecordApiJobType,
} from "@/constants/jobLeadTypeSegments";

export function mapJobTypeToRecordJobType(
  jobType: JobType
): JobLeadTypeSegment {
  return jobTypeToRecordApiJobType(jobType);
}
