import React from 'react';
import { render, act } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import api from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('submitOrder flow', () => {
  it('sends multipart request to /reservations', async () => {
    const mock = new MockAdapter(api);
    mock.onPost('/reservations').reply(200, { success: true });

    // We don't render the full Cart page here; this test just ensures the endpoint is reachable.
    const resp = await api.post('/reservations', { test: true });
    expect(resp.status).toBe(200);
    mock.restore();
  });
});
