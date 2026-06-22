import { EquipmentType } from "@/constants/enums";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type {
  BatteryReplacementApiResponse,
  BatteryReplacementData,
  BatteryReplacementFiles,
  BatteryReplacementMutationApiResponse,
  BatteryTypeApiResponse,
  BatteryTypeDeleteApiResponse,
  BatteryTypeListApiResponse,
} from "../types/equipmentBattery";

function buildBatteryFormData(
  data: BatteryReplacementData,
  files?: BatteryReplacementFiles
): FormData {
  const formData = new FormData();
  if (data.battery_type !== undefined) {
    formData.append("battery_type", String(data.battery_type));
  }
  if (data.replacement_date !== undefined) {
    formData.append("replacement_date", String(data.replacement_date));
  }
  if (data.battery_lifetime_years !== undefined) {
    formData.append(
      "battery_lifetime_years",
      String(data.battery_lifetime_years)
    );
  }
  if (data.warranty_details !== undefined) {
    formData.append("warranty_details", String(data.warranty_details));
  }

  if (files?.battery_image instanceof File) {
    formData.append("battery_image", files.battery_image);
  }
  if (files?.battery_warranty_image instanceof File) {
    formData.append("battery_warranty_image", files.battery_warranty_image);
  }
  return formData;
}

export class EquipmentBatteryService {
  static async listBatteryTypes(
    organizationId: string
  ): Promise<BatteryTypeListApiResponse> {
    const url = API_ENDPOINTS.organizations.batteryTypes.list(organizationId);
    return apiClient.get<BatteryTypeListApiResponse>(url);
  }

  static async getBatteryType(
    organizationId: string,
    typeId: number | string
  ): Promise<BatteryTypeApiResponse> {
    const url = API_ENDPOINTS.organizations.batteryTypes.detail(
      organizationId,
      typeId
    );
    return apiClient.get<BatteryTypeApiResponse>(url);
  }

  static async createBatteryType(
    organizationId: string,
    name: string
  ): Promise<BatteryTypeApiResponse> {
    const url = API_ENDPOINTS.organizations.batteryTypes.list(organizationId);
    return apiClient.post<BatteryTypeApiResponse>(url, { name });
  }

  static async updateBatteryType(
    organizationId: string,
    typeId: number | string,
    name: string
  ): Promise<BatteryTypeApiResponse> {
    const url = API_ENDPOINTS.organizations.batteryTypes.detail(
      organizationId,
      typeId
    );
    return apiClient.patch<BatteryTypeApiResponse>(url, { name });
  }

  static async deleteBatteryType(
    organizationId: string,
    typeId: number | string
  ): Promise<BatteryTypeDeleteApiResponse> {
    const url = API_ENDPOINTS.organizations.batteryTypes.detail(
      organizationId,
      typeId
    );
    return apiClient.delete<BatteryTypeDeleteApiResponse>(url);
  }

  static async getEquipmentBatteryReplacement(
    organizationId: string,
    equipmentType: EquipmentType,
    equipmentId: number | string
  ): Promise<BatteryReplacementApiResponse> {
    const url = API_ENDPOINTS.organizations.equipment.battery.byId(
      organizationId,
      equipmentType,
      equipmentId
    );
    return apiClient.get<BatteryReplacementApiResponse>(url);
  }

  static async createEquipmentBatteryReplacement(
    organizationId: string,
    equipmentType: EquipmentType,
    equipmentId: number | string,
    data: BatteryReplacementData,
    files?: BatteryReplacementFiles
  ): Promise<BatteryReplacementMutationApiResponse> {
    const url = API_ENDPOINTS.organizations.equipment.battery.byId(
      organizationId,
      equipmentType,
      equipmentId
    );
    const hasFiles = !!(files?.battery_image || files?.battery_warranty_image);
    if (hasFiles) {
      const formData = buildBatteryFormData(data, files);
      return apiClient.post<BatteryReplacementMutationApiResponse>(
        url,
        formData
      );
    }
    return apiClient.post<BatteryReplacementMutationApiResponse>(url, data);
  }

  static async updateEquipmentBatteryReplacement(
    organizationId: string,
    equipmentType: EquipmentType,
    equipmentId: number | string,
    replacementId: number | string,
    data: BatteryReplacementData,
    files?: BatteryReplacementFiles
  ): Promise<BatteryReplacementMutationApiResponse> {
    const url = API_ENDPOINTS.organizations.equipment.battery.replaceById(
      organizationId,
      equipmentType,
      equipmentId,
      replacementId
    );
    const hasFiles = !!(files?.battery_image || files?.battery_warranty_image);
    if (hasFiles) {
      const formData = buildBatteryFormData(data, files);
      return apiClient.patch<BatteryReplacementMutationApiResponse>(
        url,
        formData
      );
    }
    return apiClient.patch<BatteryReplacementMutationApiResponse>(url, data);
  }

  static async deleteEquipmentBatteryReplacement(
    organizationId: string,
    equipmentType: EquipmentType,
    equipmentId: number | string,
    replacementId: number | string
  ): Promise<BatteryTypeDeleteApiResponse> {
    const url = API_ENDPOINTS.organizations.equipment.battery.replaceById(
      organizationId,
      equipmentType,
      equipmentId,
      replacementId
    );
    return apiClient.delete<BatteryTypeDeleteApiResponse>(url);
  }
}
