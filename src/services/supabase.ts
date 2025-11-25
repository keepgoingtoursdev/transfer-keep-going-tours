import { supabase } from "@/lib/supabaseClient";

export type ZoneRow = {
  id: string;
  name: string;
  cep_start: string;
  cep_end: string;
  description?: string | null;
  price_add?: number | null;
  created_at?: string;
};

export type ServiceRow = {
  id: string;
  name: string;
  description?: string | null;
  base_price: number;
  created_at?: string;
};

export type ConfigurationRow = {
  id: string;
  key: string;
  value: string;
  created_at?: string;
};

export type VehicleRow = {
  id: string;
  name: string;
  description?: string | null;
  capacity_max: number;
  suitcases?: number; // quantidade de malas (grandes) suportadas
  price_add: number;
  active: boolean;
  service_id?: string | null;
  created_at?: string;
};

// Hospedagens (apartamentos)
export type LodgingRow = {
  id: string;
  name: string;
  description?: string | null;
  pax_per_apartment: number; // capacidade de pessoas por apartamento
  price_per_apartment: number; // valor por apartamento
  active: boolean;
  images?: string[] | null;
  created_at?: string;
};

export async function fetchZones() {
  const { data, error } = await supabase
    .from("zones")
    .select("id,name,cep_start,cep_end,description,price_add,created_at")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data || []) as ZoneRow[];
}

export async function fetchServices() {
  const { data, error } = await supabase
    .from("services")
    .select("id,name,description,base_price,created_at")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data || []) as ServiceRow[];
}

export async function fetchConfigurations(keys?: string[]) {
  let query = supabase.from("configurations").select("id,key,value,created_at");
  if (keys && keys.length) {
    query = query.in("key", keys);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ConfigurationRow[];
}

export async function fetchVehicles() {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id,name,description,capacity_max,suitcases,price_add,active,service_id,created_at",
    )
    .eq("active", true)
    .order("capacity_max", { ascending: true });
  if (error) throw error;
  return (data || []) as VehicleRow[];
}

export async function fetchVehiclesAdmin() {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id,name,description,capacity_max,suitcases,price_add,active,service_id,created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as VehicleRow[];
}

export async function fetchLodgings() {
  const { data, error } = await supabase
    .from("lodgings")
    .select(
      "id,name,description,pax_per_apartment,price_per_apartment,active,images,created_at",
    )
    .eq("active", true)
    .order("price_per_apartment", { ascending: true });
  if (error) throw error;
  return (data || []) as LodgingRow[];
}

export async function fetchLodgingsAdmin() {
  const { data, error } = await supabase
    .from("lodgings")
    .select(
      "id,name,description,pax_per_apartment,price_per_apartment,active,images,created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as LodgingRow[];
}

// Mutations
export async function upsertConfiguration(key: string, value: string) {
  const { data, error } = await supabase
    .from("configurations")
    .upsert({ key, value }, { onConflict: "key" })
    .select();
  if (error) throw error;
  return data as ConfigurationRow[];
}

// Services CRUD
export async function insertService(payload: {
  name: string;
  description?: string | null;
  base_price: number;
}) {
  const { data, error } = await supabase
    .from("services")
    .insert(payload)
    .select();
  if (error) throw error;
  return data as ServiceRow[];
}

export async function updateService(id: string, patch: Partial<ServiceRow>) {
  const { data, error } = await supabase
    .from("services")
    .update(patch)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data as ServiceRow[];
}

export async function deleteService(id: string) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function insertZone(payload: {
  name: string;
  cep_start: string;
  cep_end: string;
  description?: string | null;
  price_add?: number | null;
}) {
  const { data, error } = await supabase.from("zones").insert(payload).select();
  if (error) throw error;
  return data as ZoneRow[];
}

export async function updateZone(id: string, patch: Partial<ZoneRow>) {
  const { data, error } = await supabase
    .from("zones")
    .update(patch)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data as ZoneRow[];
}

export async function deleteZone(id: string) {
  const { error } = await supabase.from("zones").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// Vehicles CRUD
export async function insertVehicle(payload: {
  name: string;
  description?: string | null;
  capacity_max: number;
  suitcases?: number;
  price_add: number;
  active: boolean;
  service_id?: string | null;
}) {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(payload)
    .select();
  if (error) throw error;
  return data as VehicleRow[];
}

// Lodgings CRUD
export async function insertLodging(payload: {
  name: string;
  description?: string | null;
  pax_per_apartment: number;
  price_per_apartment: number;
  active: boolean;
  images?: string[] | null;
}) {
  const { data, error } = await supabase
    .from("lodgings")
    .insert(payload)
    .select();
  if (error) throw error;
  return data as LodgingRow[];
}

export async function updateLodging(id: string, patch: Partial<LodgingRow>) {
  const { data, error } = await supabase
    .from("lodgings")
    .update(patch)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data as LodgingRow[];
}

export async function deleteLodging(id: string) {
  const { error } = await supabase.from("lodgings").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateVehicle(id: string, patch: Partial<VehicleRow>) {
  const { data, error } = await supabase
    .from("vehicles")
    .update(patch)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data as VehicleRow[];
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export function normalizeCepDb(value: string): string {
  // Aceita "00000-000" ou apenas dígitos; retorna dígitos 8
  return (value || "").replace(/\D/g, "").padStart(8, "0").slice(0, 8);
}

export function findZoneByCepFromDb(
  zones: ZoneRow[],
  cepRaw: string,
): ZoneRow | null {
  const cep = normalizeCepDb(cepRaw);
  if (cep.length !== 8) return null;
  const numericBetween = (start: string, end: string) => {
    const s = normalizeCepDb(start);
    const e = normalizeCepDb(end);
    return cep >= s && cep <= e;
  };
  return zones.find((z) => numericBetween(z.cep_start, z.cep_end)) || null;
}

export async function getSeasonDates() {
  const configs = await fetchConfigurations([
    "season_start_date",
    "season_end_date",
  ]);
  const start =
    configs.find((c) => c.key === "season_start_date")?.value || null;
  const end = configs.find((c) => c.key === "season_end_date")?.value || null;
  return { start, end };
}
