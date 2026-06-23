import type { MockRoute } from "./types";

/**
 * EQUIPMENT module — "Sajid & Sons Contractors" (org id 1).
 *
 * Endpoints (normalized URLs the mock matches):
 *  - Unified list      ms/organizations/1/equipment/all/
 *  - By-type list      ms/organizations/1/equipment-v2/machines|vehicles|trailers/
 *  - Detail            ms/organizations/1/equipment-v2/<type>/<id>/
 *  - Battery types     ms/organizations/1/battery-types/        (verbatim {success,data})
 *  - Battery record    ms/organizations/1/equipment-v2/<type>/<id>/battery-replacement/ (verbatim)
 *
 * Type discrimination in the unified list is by field presence:
 *  machine -> has `current_hours`, vehicle -> has `current_miles`, else -> trailer.
 * `id` and `equipment_ptr_id` are kept aligned so detail navigation resolves.
 */

// ============================================
// MACHINES (current_hours + tracker_status + hour_rate + maintenance_attributes)
// ============================================

const machine1 = {
  id: 1,
  equipment_ptr_id: 1,
  machine_name: "CAT 336 Excavator",
  make: "Caterpillar",
  year: 2021,
  model: "336",
  color: "Cat Yellow",
  serial_number: "CAT336-0001-IA",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  assigned_team_member: 4,
  current_hours: 3420,
  tracker_status: "Y",
  hour_rate: 185,
  maintenance_attributes: [
    {
      id: 11,
      title: "fuel_filter",
      filter_number: "FF-336-A",
      threshold: 500,
      last_changed: 3000,
      need_maintenance: false,
      automatic: true,
    },
    {
      id: 12,
      title: "hydraulic_filter",
      filter_number: "HF-336-B",
      threshold: 1000,
      last_changed: 2600,
      need_maintenance: true,
      automatic: true,
    },
    {
      id: 13,
      title: "oil_filter",
      filter_number: "OF-336-C",
      threshold: 250,
      last_changed: 3300,
      need_maintenance: false,
      automatic: true,
    },
  ],
  created_at: "2026-01-12T08:15:00Z",
  last_updated: "2026-06-18T14:42:00Z",
};

const machine2 = {
  id: 2,
  equipment_ptr_id: 2,
  machine_name: "John Deere 9RX Tractor",
  make: "John Deere",
  year: 2022,
  model: "9RX 540",
  color: "Green",
  serial_number: "JD9RX-0042-IL",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  assigned_team_member: 3,
  current_hours: 1880,
  tracker_status: "Y",
  hour_rate: 160,
  maintenance_attributes: [
    {
      id: 21,
      title: "air_filter",
      filter_number: "AF-9RX-1",
      threshold: 400,
      last_changed: 1600,
      need_maintenance: false,
      automatic: true,
    },
    {
      id: 22,
      title: "oil_filter",
      filter_number: "OF-9RX-2",
      threshold: 300,
      last_changed: 1500,
      need_maintenance: true,
      automatic: true,
    },
  ],
  created_at: "2026-01-20T09:30:00Z",
  last_updated: "2026-06-10T11:05:00Z",
};

const machine3 = {
  id: 3,
  equipment_ptr_id: 3,
  machine_name: "Soil-Max Gold Tile Plow",
  make: "Soil-Max",
  year: 2020,
  model: "Gold Series",
  color: "Red",
  serial_number: "SMGS-2020-7781",
  service_status: "U",
  equipment_image: null,
  serial_number_image: null,
  assigned_team_member: 5,
  current_hours: 2675,
  tracker_status: "N",
  hour_rate: 140,
  maintenance_attributes: [
    {
      id: 31,
      title: "hydraulic_filter",
      filter_number: "HF-SM-9",
      threshold: 600,
      last_changed: 2100,
      need_maintenance: true,
      automatic: true,
    },
  ],
  created_at: "2026-02-02T07:45:00Z",
  last_updated: "2026-05-28T16:20:00Z",
};

const machine4 = {
  id: 4,
  equipment_ptr_id: 4,
  machine_name: "Wolfe Heavy Equipment Trencher",
  make: "Wolfe",
  year: 2019,
  model: "WT-200",
  color: "Orange",
  serial_number: "WT200-2019-3304",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  assigned_team_member: 4,
  current_hours: 4510,
  tracker_status: "Y",
  hour_rate: 175,
  maintenance_attributes: [
    {
      id: 41,
      title: "fuel_filter",
      filter_number: "FF-WT-3",
      threshold: 500,
      last_changed: 4200,
      need_maintenance: false,
      automatic: true,
    },
    {
      id: 42,
      title: "air_filter",
      filter_number: "AF-WT-4",
      threshold: 450,
      last_changed: 3900,
      need_maintenance: true,
      automatic: true,
    },
  ],
  created_at: "2026-01-08T10:00:00Z",
  last_updated: "2026-06-21T09:12:00Z",
};

const machine5 = {
  id: 5,
  equipment_ptr_id: 5,
  machine_name: "Bobcat T770 Track Loader",
  make: "Bobcat",
  year: 2023,
  model: "T770",
  color: "White",
  serial_number: "BCT770-2023-5519",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  assigned_team_member: 3,
  current_hours: 640,
  tracker_status: "Y",
  hour_rate: 120,
  maintenance_attributes: [
    {
      id: 51,
      title: "oil_filter",
      filter_number: "OF-T770-1",
      threshold: 250,
      last_changed: 500,
      need_maintenance: false,
      automatic: true,
    },
  ],
  created_at: "2026-03-15T13:25:00Z",
  last_updated: "2026-06-19T08:50:00Z",
};

// ============================================
// VEHICLES (current_miles + license_plate, no current_hours)
// ============================================

const vehicle1 = {
  id: 6,
  equipment_ptr_id: 6,
  machine_name: "Mack Granite Dump Truck",
  make: "Mack",
  year: 2020,
  model: "Granite 64FR",
  color: "Black",
  serial_number: "1M2GR2GC0LM012345",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  assigned_team_member: 4,
  current_miles: 84210,
  license_plate: "IA-DMP-204",
  created_at: "2026-01-15T08:00:00Z",
  last_updated: "2026-06-17T10:30:00Z",
};

const vehicle2 = {
  id: 7,
  equipment_ptr_id: 7,
  machine_name: "Ford F-350 Crew Cab",
  make: "Ford",
  year: 2022,
  model: "F-350 Super Duty",
  color: "Blue",
  serial_number: "1FT8W3DT5NEC54321",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  assigned_team_member: 2,
  current_miles: 41560,
  license_plate: "IA-FLD-118",
  created_at: "2026-02-10T09:10:00Z",
  last_updated: "2026-06-14T15:45:00Z",
};

const vehicle3 = {
  id: 8,
  equipment_ptr_id: 8,
  machine_name: "RAM 2500 Service Truck",
  make: "RAM",
  year: 2021,
  model: "2500 Tradesman",
  color: "Silver",
  serial_number: "3C6UR5HL2MG778899",
  service_status: "U",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  assigned_team_member: 5,
  current_miles: 62340,
  license_plate: "IL-SVC-907",
  created_at: "2026-02-22T11:35:00Z",
  last_updated: "2026-05-30T12:00:00Z",
};

const vehicle4 = {
  id: 9,
  equipment_ptr_id: 9,
  machine_name: "Chevrolet Silverado 1500",
  make: "Chevrolet",
  year: 2023,
  model: "Silverado 1500 LT",
  color: "Red",
  serial_number: "1GCUYDED5PZ223344",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  assigned_team_member: 6,
  current_miles: 18920,
  license_plate: "IA-OPS-552",
  created_at: "2026-03-30T07:55:00Z",
  last_updated: "2026-06-20T17:25:00Z",
};

// ============================================
// TRAILERS (no current_hours, no current_miles -> trailer)
// ============================================

const trailer1 = {
  id: 10,
  equipment_ptr_id: 10,
  machine_name: "PJ Lowboy Equipment Trailer",
  make: "PJ Trailers",
  year: 2020,
  model: "LD 35-Ton",
  color: "Black",
  serial_number: "PJLB-2020-66120",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  tracker_status: "Y",
  license_plate: "IA-TRL-330",
  assigned_team_member: 4,
  created_at: "2026-01-25T10:40:00Z",
  last_updated: "2026-06-12T13:15:00Z",
};

const trailer2 = {
  id: 11,
  equipment_ptr_id: 11,
  machine_name: "Big Tex Gooseneck Trailer",
  make: "Big Tex",
  year: 2021,
  model: "22GN-25",
  color: "Gray",
  serial_number: "BGTX-2021-44781",
  service_status: "A",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  tracker_status: "N",
  license_plate: "IL-TRL-771",
  assigned_team_member: 3,
  created_at: "2026-02-18T08:20:00Z",
  last_updated: "2026-06-08T09:00:00Z",
};

const trailer3 = {
  id: 12,
  equipment_ptr_id: 12,
  machine_name: "Load Trail Tilt Deck Trailer",
  make: "Load Trail",
  year: 2019,
  model: "TD 102x24",
  color: "Blue",
  serial_number: "LDTR-2019-90034",
  service_status: "U",
  equipment_image: null,
  serial_number_image: null,
  registration_image: null,
  insurance_image: null,
  tracker_status: "N",
  license_plate: "IA-TRL-619",
  assigned_team_member: null,
  created_at: "2026-03-05T14:05:00Z",
  last_updated: "2026-05-22T11:40:00Z",
};

const machines = [machine1, machine2, machine3, machine4, machine5];
const vehicles = [vehicle1, vehicle2, vehicle3, vehicle4];
const trailers = [trailer1, trailer2, trailer3];

// ============================================
// BATTERY REPLACEMENT RECORDS (per-equipment detail, served verbatim)
// ============================================

const batteryRecordFor = (equipmentId: number) => ({
  success: true,
  message: "OK",
  data: {
    id: 500 + equipmentId,
    equipment: equipmentId,
    battery_type: 1,
    battery_type_name: "Group 31 AGM",
    replacement_date: "2026-02-14",
    battery_lifetime_years: "4.0",
    battery_lifetime_display: "4 years",
    next_replacement_date: "2030-02-14",
    warranty_details: "36-month free replacement / 60-month pro-rated",
    battery_image: null,
    battery_warranty_image: null,
    battery_image_url: null,
    battery_warranty_image_url: null,
    created_at: "2026-02-14T10:00:00Z",
    updated_at: "2026-02-14T10:00:00Z",
  },
});

const emptyBatteryRecord = {
  success: true,
  message: "No battery replacement on record",
  data: null,
};

export const routes: MockRoute[] = [
  // ----------------------------------------
  // BATTERY TYPES CATALOG (verbatim {success, data})
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/battery-types\/?$/,
    list: false,
    data: {
      success: true,
      message: "OK",
      data: [
        {
          id: 1,
          name: "Group 31 AGM",
          created_at: "2026-01-05T08:00:00Z",
          updated_at: "2026-01-05T08:00:00Z",
        },
        {
          id: 2,
          name: "Group 65 Lead-Acid",
          created_at: "2026-01-05T08:00:00Z",
          updated_at: "2026-01-05T08:00:00Z",
        },
        {
          id: 3,
          name: "12V Heavy Equipment Deep Cycle",
          created_at: "2026-01-08T08:00:00Z",
          updated_at: "2026-01-08T08:00:00Z",
        },
        {
          id: 4,
          name: "Diesel Dual-Battery 1000CCA",
          created_at: "2026-01-10T08:00:00Z",
          updated_at: "2026-01-10T08:00:00Z",
        },
      ],
    },
  },

  // ----------------------------------------
  // BATTERY REPLACEMENT — per-equipment detail (must precede equipment detail regexes)
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/equipment-v2\/(machines|vehicles|trailers)\/8\/battery-replacement\/?$/,
    list: false,
    data: emptyBatteryRecord,
  },
  {
    match: /^ms\/organizations\/\d+\/equipment-v2\/(machines|vehicles|trailers)\/(\d+)\/battery-replacement\/?$/,
    list: false,
    data: batteryRecordFor(1),
  },

  // ----------------------------------------
  // EQUIPMENT DETAIL — by type + id (must precede the by-type list routes)
  // ----------------------------------------
  { match: /^ms\/organizations\/\d+\/equipment-v2\/machines\/1\/?$/, list: false, data: machine1 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/machines\/2\/?$/, list: false, data: machine2 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/machines\/3\/?$/, list: false, data: machine3 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/machines\/4\/?$/, list: false, data: machine4 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/machines\/5\/?$/, list: false, data: machine5 },
  // Fallback for any other machine id
  { match: /^ms\/organizations\/\d+\/equipment-v2\/machines\/\d+\/?$/, list: false, data: machine1 },

  { match: /^ms\/organizations\/\d+\/equipment-v2\/vehicles\/6\/?$/, list: false, data: vehicle1 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/vehicles\/7\/?$/, list: false, data: vehicle2 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/vehicles\/8\/?$/, list: false, data: vehicle3 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/vehicles\/9\/?$/, list: false, data: vehicle4 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/vehicles\/\d+\/?$/, list: false, data: vehicle1 },

  { match: /^ms\/organizations\/\d+\/equipment-v2\/trailers\/10\/?$/, list: false, data: trailer1 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/trailers\/11\/?$/, list: false, data: trailer2 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/trailers\/12\/?$/, list: false, data: trailer3 },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/trailers\/\d+\/?$/, list: false, data: trailer1 },

  // ----------------------------------------
  // EQUIPMENT BY-TYPE LISTS
  // ----------------------------------------
  { match: /^ms\/organizations\/\d+\/equipment-v2\/machines\/?$/, data: machines },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/vehicles\/?$/, data: vehicles },
  { match: /^ms\/organizations\/\d+\/equipment-v2\/trailers\/?$/, data: trailers },

  // ----------------------------------------
  // UNIFIED EQUIPMENT LIST (machines + vehicles + trailers, mixed)
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/equipment\/all\/?$/,
    data: [...machines, ...vehicles, ...trailers],
  },
];
