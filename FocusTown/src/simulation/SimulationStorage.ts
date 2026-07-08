import { invoke } from "@tauri-apps/api/core"

export async function saveSimulation(name: string, data: string): Promise<void> {
  await invoke("save_simulation", { name, data })
}

export async function loadSimulation(name: string): Promise<string> {
  return await invoke("load_simulation", { name }) as string
}

export async function listSaves(): Promise<{ name: string; created_at: string }[]> {
  return await invoke("list_saves") as { name: string; created_at: string }[]
}

export async function deleteSave(name: string): Promise<void> {
  await invoke("delete_save", { name })
}