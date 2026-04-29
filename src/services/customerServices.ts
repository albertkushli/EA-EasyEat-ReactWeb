import { Customer } from "../types/Customer";

const API_URL = "http://localhost:1337/customers";

type BackendResponse = {
  data?: Customer[];
  meta?: any;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error fetching customers");

  const json: BackendResponse = await res.json();
  console.log("CLIENTS (raw):", json);

  return json.data || [];
};