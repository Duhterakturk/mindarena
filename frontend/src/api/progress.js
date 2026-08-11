import apiClient from "./client";

export async function fetchMyProgress() {
  const { data } = await apiClient.get("/progress/me");
  return data;
}

export async function fetchChildProgress(childId) {
  const { data } = await apiClient.get(`/progress/child/${childId}`);
  return data;
}

export async function fetchStudentsOverview(classroomId) {
  const { data } = await apiClient.get("/progress/students", {
    params: classroomId ? { classroom_id: classroomId } : {},
  });
  return data;
}

export async function downloadProgressExport() {
  const response = await apiClient.get("/progress/export", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "mindarena-ilerleme.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
