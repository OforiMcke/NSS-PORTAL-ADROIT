import api from "./axiosInstance";

const BASE = "/api/job-roles";

export const getJobRoles = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const createJobRole = async (title) => {
  const res = await api.post(BASE, { title });
  return res.data;
};

export const deleteJobRole = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};
