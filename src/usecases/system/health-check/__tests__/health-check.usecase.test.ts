import { describe, expect, it } from 'vitest';
import { HealthCheckUseCase } from '../health-check.usecase';

describe('HealthCheckUseCase', () => {
  it('returns an API availability payload', () => {
    const result = new HealthCheckUseCase().execute();

    expect(result.status).toBe('ok');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
