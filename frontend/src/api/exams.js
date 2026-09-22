import apiClient from "./client";

export async function fetchCurrentExam() {
  const { data } = await apiClient.get("/exams/current");
  return data;
}

export async function startExam() {
  const { data } = await apiClient.post("/exams");
  return data;
}
