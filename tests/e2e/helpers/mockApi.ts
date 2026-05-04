import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

function readFixture<T>(fileName: string): T {
  return JSON.parse(readFileSync(new URL(`../fixtures/${fileName}`, import.meta.url), 'utf-8')) as T;
}

const stations = readFixture<unknown[]>('stations.json');
const sensors1 = readFixture<unknown[]>('sensors-1.json');
const measurements101 = readFixture<object>('measurements-101.json');
const measurements102 = readFixture<object>('measurements-102.json');
const aqi1 = readFixture<object>('aqi-1.json');
const aqiEmpty = readFixture<object>('aqi-empty.json');

export async function mockGiosApi(page: Page): Promise<void> {
  await page.route('**/station/findAll', (route) => route.fulfill({ json: stations }));
  await page.route('**/station/sensors/1', (route) => route.fulfill({ json: sensors1 }));
  await page.route('**/station/sensors/2', (route) => route.fulfill({ json: [] }));
  await page.route('**/station/sensors/3', (route) => route.fulfill({ json: [] }));
  await page.route('**/data/getData/101', (route) => route.fulfill({ json: measurements101 }));
  await page.route('**/data/getData/102', (route) => route.fulfill({ json: measurements102 }));
  await page.route('**/aqindex/getIndex/1', (route) => route.fulfill({ json: aqi1 }));
  await page.route('**/aqindex/getIndex/2', (route) => route.fulfill({ json: aqiEmpty }));
  await page.route('**/aqindex/getIndex/3', (route) => route.fulfill({ json: aqiEmpty }));
}

export async function mockGiosApiError(page: Page): Promise<void> {
  await page.route('**/station/findAll', (route) =>
    route.fulfill({ status: 500, body: 'Internal Server Error' }),
  );
}
