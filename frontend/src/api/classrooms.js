import apiClient from "./client";

export async function createClassroom(name) {
  const { data } = await apiClient.post("/classrooms", { name });
  return data;
}

export async function fetchMyClassrooms() {
  const { data } = await apiClient.get("/classrooms/mine");
  return data;
}

export async function joinClassroom(joinCode) {
  const { data } = await apiClient.post("/classrooms/join", { join_code: joinCode });
  return data;
}

export async function leaveClassroom() {
  const { data } = await apiClient.post("/classrooms/leave");
  return data;
}
