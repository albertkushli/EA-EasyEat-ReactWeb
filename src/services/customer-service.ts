
import { useEffect, useState } from 'react';
import axios, { CanceledError } from 'axios';
import { ICustomer } from '../models/customer-model';
import apiClient from '../lib/apiClient';

interface CustomerServiceReturn {
  customers: ICustomer[];
  loading: boolean;
  error: string;
  updateCustomer: (customer: ICustomer) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  fetchCustomer: (customerId: string) => void;
}

const baseUrl: string = 'http://localhost:1337';

export const customerService = {
  fetchCustomer: async (customerId: string) => {
    const res = await apiClient.get<ICustomer>(`/customers/${customerId}`);
    return res.data;
  },

  updateCustomer: async (customerId: string, customer: ICustomer) => {
    const res = await apiClient.put<ICustomer>(`/customers/${customerId}`, customer);
    return res.data
  }
};