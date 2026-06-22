import type {
  EquipmentListParams,
  MachineCreatePayload,
  MachineV2,
  PaginatedEquipmentResponse,
  TrailerCreatePayload,
  TrailerV2,
  VehicleCreatePayload,
  VehicleV2,
} from "@/api/types";
import { EquipmentType } from "@/constants/enums";

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";

export class EquipmentService {
  // ============================================
  // GENERIC EQUIPMENT OPERATIONS (V2)
  // ============================================

  static async getByType<T>(
    organizationId: string,
    type: EquipmentType,
    params: EquipmentListParams = {}
  ): Promise<PaginatedEquipmentResponse<T> | T[]> {
    const endpoint = API_ENDPOINTS.organizations.equipment.listByType(
      organizationId,
      type
    );
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get<PaginatedEquipmentResponse<T> | T[]>(
      `${endpoint}${queryString}`
    );
  }

  static async getById<T>(
    organizationId: string,
    type: EquipmentType,
    id: number | string
  ): Promise<T> {
    const endpoint = API_ENDPOINTS.organizations.equipment.detail(
      organizationId,
      type,
      id
    );
    return apiClient.get<T>(endpoint);
  }

  static async create<T, P>(
    organizationId: string,
    type: EquipmentType,
    data: P
  ): Promise<T> {
    const endpoint = API_ENDPOINTS.organizations.equipment.create(
      organizationId,
      type
    );
    return apiClient.post<T>(endpoint, data);
  }

  static async update<T, P>(
    organizationId: string,
    type: EquipmentType,
    id: number | string,
    data: Partial<P>
  ): Promise<T> {
    const endpoint = API_ENDPOINTS.organizations.equipment.detail(
      organizationId,
      type,
      id
    );
    return apiClient.patch<T>(endpoint, data);
  }

  static async delete(
    organizationId: string,
    type: EquipmentType,
    id: number | string
  ): Promise<void> {
    const endpoint = API_ENDPOINTS.organizations.equipment.detail(
      organizationId,
      type,
      id
    );
    return apiClient.delete<void>(endpoint);
  }

  static async uploadImage<T>(
    organizationId: string,
    type: EquipmentType,
    id: number | string,
    file: File
  ): Promise<T> {
    const endpoint = API_ENDPOINTS.organizations.equipment.uploadImage(
      organizationId,
      type,
      id
    );
    const formData = new FormData();
    formData.append("equipment_image", file);
    return apiClient.uploadFile<T>(endpoint, formData);
  }

  // ============================================
  // MACHINES
  // ============================================

  static async getMachines(
    organizationId: string,
    params: EquipmentListParams = {}
  ): Promise<PaginatedEquipmentResponse<MachineV2> | MachineV2[]> {
    return this.getByType<MachineV2>(
      organizationId,
      EquipmentType.MACHINES,
      params
    );
  }

  static async getMachine(
    organizationId: string,
    id: number | string
  ): Promise<MachineV2> {
    return this.getById<MachineV2>(organizationId, EquipmentType.MACHINES, id);
  }

  static async createMachine(
    organizationId: string,
    data: MachineCreatePayload
  ): Promise<MachineV2> {
    return this.create<MachineV2, MachineCreatePayload>(
      organizationId,
      EquipmentType.MACHINES,
      data
    );
  }

  static async updateMachine(
    organizationId: string,
    id: number | string,
    data: Partial<MachineCreatePayload>
  ): Promise<MachineV2> {
    return this.update<MachineV2, MachineCreatePayload>(
      organizationId,
      EquipmentType.MACHINES,
      id,
      data
    );
  }

  static async deleteMachine(
    organizationId: string,
    id: number | string
  ): Promise<void> {
    return this.delete(organizationId, EquipmentType.MACHINES, id);
  }

  // ============================================
  // VEHICLES
  // ============================================

  static async getVehicles(
    organizationId: string,
    params: EquipmentListParams = {}
  ): Promise<PaginatedEquipmentResponse<VehicleV2> | VehicleV2[]> {
    return this.getByType<VehicleV2>(
      organizationId,
      EquipmentType.VEHICLES,
      params
    );
  }

  static async getVehicle(
    organizationId: string,
    id: number | string
  ): Promise<VehicleV2> {
    return this.getById<VehicleV2>(organizationId, EquipmentType.VEHICLES, id);
  }

  static async createVehicle(
    organizationId: string,
    data: VehicleCreatePayload
  ): Promise<VehicleV2> {
    return this.create<VehicleV2, VehicleCreatePayload>(
      organizationId,
      EquipmentType.VEHICLES,
      data
    );
  }

  static async updateVehicle(
    organizationId: string,
    id: number | string,
    data: Partial<VehicleCreatePayload>
  ): Promise<VehicleV2> {
    return this.update<VehicleV2, VehicleCreatePayload>(
      organizationId,
      EquipmentType.VEHICLES,
      id,
      data
    );
  }

  static async deleteVehicle(
    organizationId: string,
    id: number | string
  ): Promise<void> {
    return this.delete(organizationId, EquipmentType.VEHICLES, id);
  }

  // ============================================
  // TRAILERS
  // ============================================

  static async getTrailers(
    organizationId: string,
    params: EquipmentListParams = {}
  ): Promise<PaginatedEquipmentResponse<TrailerV2> | TrailerV2[]> {
    return this.getByType<TrailerV2>(
      organizationId,
      EquipmentType.TRAILERS,
      params
    );
  }

  static async getTrailer(
    organizationId: string,
    id: number | string
  ): Promise<TrailerV2> {
    return this.getById<TrailerV2>(organizationId, EquipmentType.TRAILERS, id);
  }

  static async createTrailer(
    organizationId: string,
    data: TrailerCreatePayload
  ): Promise<TrailerV2> {
    return this.create<TrailerV2, TrailerCreatePayload>(
      organizationId,
      EquipmentType.TRAILERS,
      data
    );
  }

  static async updateTrailer(
    organizationId: string,
    id: number | string,
    data: Partial<TrailerCreatePayload>
  ): Promise<TrailerV2> {
    return this.update<TrailerV2, TrailerCreatePayload>(
      organizationId,
      EquipmentType.TRAILERS,
      id,
      data
    );
  }

  static async deleteTrailer(
    organizationId: string,
    id: number | string
  ): Promise<void> {
    return this.delete(organizationId, EquipmentType.TRAILERS, id);
  }

  static async putToTrash(
    organizationId: string,
    type: EquipmentType,
    id: number | string
  ): Promise<unknown> {
    const endpoint = API_ENDPOINTS.organizations.equipment.putToTrash(
      organizationId,
      type,
      id
    );
    return apiClient.post<unknown>(endpoint);
  }

  // ============================================
  // LEGACY / UNIFIED EQUIPMENT LIST
  // ============================================

  static async getAllEquipment(
    organizationId: string,
    params: EquipmentListParams = {}
  ): Promise<
    | PaginatedEquipmentResponse<MachineV2 | VehicleV2 | TrailerV2>
    | (MachineV2 | VehicleV2 | TrailerV2)[]
  > {
    const endpoint = API_ENDPOINTS.organizations.equipment.list(organizationId);
    const queryString = apiClient.buildQueryString(params);
    return apiClient.get(`${endpoint}${queryString}`);
  }
}
