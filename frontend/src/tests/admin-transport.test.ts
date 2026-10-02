import {afterEach, describe, expect, it, vi} from 'vitest';
import {apiRequest, ApiError, downloadApiFile} from '@/lib/apiClient';
import {adminApi, adminError} from '@/features/admin/api';

afterEach(() => {vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();});
describe('administration transport', () => {
  it('keeps a binary PDF and server filename instead of parsing it as JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('%PDF-1.4\nreport', {headers: {'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="Reporte_centers_01102026_1200.pdf"'}})));
    const result = await apiRequest<{blob: Blob; filename: string}>('/admin/reports/export', {method: 'POST', body: {reportType: 'centers', format: 'pdf', startDate: '2026-01-01', endDate: '2026-12-31'}, responseType: 'download'});
    expect(result.filename).toBe('Reporte_centers_01102026_1200.pdf');
    expect(await result.blob.text()).toBe('%PDF-1.4\nreport');
  });
  it('does not create a download for an empty report or an expired session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({error: {code: 'empty_report', message: 'No hay registros.'}}), {status: 422})));
    await expect(downloadApiFile('/admin/reports/export', {})).rejects.toMatchObject({code: 'empty_report', status: 422});
  });
  it('serializes report filters without sending blank optional values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({rows: [], total: 0, page: 1, pageSize: 20})));
    vi.stubGlobal('fetch', fetchMock);
    await adminApi.reports({reportType: 'centers', startDate: '2026-01-01', status: '', provinceId: undefined, page: 2});
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({reportType: 'centers', startDate: '2026-01-01', page: '2'});
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });
  it('uses the correct moderation contract and no credentials in request parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({status: 'DISCARDED'})));
    vi.stubGlobal('fetch', fetchMock);
    await adminApi.moderate(23, 'DISCARDED', 'La opinión no incumple las normas.');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/admin\/review-reports\/23\/moderate$/);
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({status: 'DISCARDED', justification: 'La opinión no incumple las normas.'});
  });
  it('does not mislabel permission failures as duplicate reports', () => {
    expect(adminError(new ApiError('Forbidden', 403))).toContain('permiso');
    expect(adminError(new ApiError('Expired', 401))).toContain('sesión');
    expect(adminError(new Error('network'))).toContain('conectar');
  });
});
