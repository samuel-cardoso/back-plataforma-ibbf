import { describe, expect, it } from 'vitest';
import { FinancePeriod, Fund } from '@/models';

describe('FinancePeriod', () => {
  it('fecha e reabre com motivo', () => {
    const period = FinancePeriod.open(2026, 10);
    period.close('user-1');
    expect(period.isClosed).toBe(true);

    expect(() => period.reopen('  ')).toThrow(expect.objectContaining({ code: 'FINANCE_PERIOD.REOPEN_REASON_REQUIRED' }));
    period.reopen('lançamento esquecido');
    expect(period.isClosed).toBe(false);
    expect(period.reopenReason).toBe('lançamento esquecido');
  });

  it('não fecha duas vezes', () => {
    const period = FinancePeriod.open(2026, 10);
    period.close('user-1');
    expect(() => period.close('user-1')).toThrow(expect.objectContaining({ code: 'FINANCE_PERIOD.ALREADY_CLOSED' }));
  });
});

describe('Fund', () => {
  it('normaliza o txid Pix e rejeita caracteres inválidos', () => {
    expect(Fund.create({ name: 'Missões', pixTxid: 'missoes' }).pixTxid).toBe('MISSOES');
    expect(() => Fund.create({ name: 'X', pixTxid: 'com espaço' })).toThrow(expect.objectContaining({ code: 'FUND.INVALID_PIX_TXID' }));
  });
});
