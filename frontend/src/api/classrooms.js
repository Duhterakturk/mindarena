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

export async function createAssignment(classroomId, payload) {
  const { data } = await apiClient.post(`/classrooms/${classroomId}/assignment`, payload);
  return data;
}

export async function fetchAssignment(classroomId) {
  const { data } = await apiClient.get(`/classrooms/${classroomId}/assignment`);
  return data;
}

export async function setStudentPassword(classroomId, studentId, password) {
  const { data } = await apiClient.post(
    `/classrooms/${classroomId}/students/${studentId}/password`,
    { password }
  );
  return data;
}

export async function fetchMyAssignment() {
  const { data } = await apiClient.get("/assignments/mine");
  return data;
}
