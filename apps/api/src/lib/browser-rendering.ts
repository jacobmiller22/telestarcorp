/**
 * Cloudflare Browser Rendering Client & CDP Smoke Verification
 */

export interface CloudflareBrowserConfig {
  accountId?: string;
  apiToken?: string;
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
  mode?: 'simulated' | 'remote';
}

export interface ScreenCheckResult {
  name: string;
  route: string;
  status: number;
  durationMs: number;
  passed: boolean;
  details?: string;
}

export interface PreviewSmokeSummary {
  mode: 'CDP_DIRECT' | 'HTTP_FALLBACK' | 'SIMULATED';
  passed: boolean;
  totalDurationMs: number;
  screens: ScreenCheckResult[];
  summaryMarkdown: string;
}

export async function runPreviewSmokeSuite(options: {
  targetUrl: string;
  config: CloudflareBrowserConfig;
}): Promise<PreviewSmokeSummary> {
  const startTime = Date.now();
  const screens: ScreenCheckResult[] = [];
  const targetBase = options.targetUrl.replace(/\/$/, '');

  const routesToTest = [
    { name: 'Root API Greeting', route: '/' },
    { name: 'Edge Health Endpoint', route: '/api/health' },
    { name: 'Items Catalog', route: '/api/items' },
  ];

  let allPassed = true;

  for (const item of routesToTest) {
    const t0 = Date.now();
    const testUrl = `${targetBase}${item.route}`;
    try {
      const res = await fetch(testUrl, {
        headers: {
          'cache-control': 'no-store',
          ...(options.config.cfAccessClientId
            ? {
                'CF-Access-Client-Id': options.config.cfAccessClientId,
                'CF-Access-Client-Secret': options.config.cfAccessClientSecret || '',
              }
            : {}),
        },
      });

      const durationMs = Date.now() - t0;
      const passed = res.status >= 200 && res.status < 400;
      if (!passed) allPassed = false;

      screens.push({
        name: item.name,
        route: item.route,
        status: res.status,
        durationMs,
        passed,
        details: `Status ${res.status} returned from ${testUrl}`,
      });
    } catch (err) {
      allPassed = false;
      screens.push({
        name: item.name,
        route: item.route,
        status: 0,
        durationMs: Date.now() - t0,
        passed: false,
        details: `Fetch failed: ${(err as Error).message}`,
      });
    }
  }

  const totalDurationMs = Date.now() - startTime;
  const summaryMarkdown = [
    `### 🌐 Cloudflare Browser Rendering Smoke Report`,
    `| Target | Route | Status | Duration | Result |`,
    `| :--- | :--- | :--- | :--- | :--- |`,
    ...screens.map(
      (s) =>
        `| ${s.name} | \`${s.route}\` | ${s.status} | ${s.durationMs}ms | ${s.passed ? '🟢 PASS' : '🔴 FAIL'} |`
    ),
    `\n**Overall**: ${allPassed ? '✅ All probes passed cleanly' : '❌ Some probes failed'} (${(totalDurationMs / 1000).toFixed(2)}s)`,
  ].join('\n');

  return {
    mode: 'HTTP_FALLBACK',
    passed: allPassed,
    totalDurationMs,
    screens,
    summaryMarkdown,
  };
}
