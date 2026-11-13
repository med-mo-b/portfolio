import { expect, test } from 'bun:test';
const mc = require('./monte-carlo.cjs');

test('ten staged samples retain spread and use the two central values for the median', () => {
    const plan = mc.samplePlan({ sigmaLo: -2, sigmaHi: 2, predX: 0, yAxis: 0 });
    expect(plan.order).toHaveLength(10);
    expect(new Set(plan.order.map((p: { k: number }) => p.k)).size).toBe(10);
    const sorted = [...plan.xs].sort((a: number, b: number) => a - b);
    expect(plan.medianX).toBeCloseTo((sorted[4] + sorted[5]) / 2);
    expect(plan.medianX).toBe(0);
    expect(sorted[9] - sorted[0]).toBeGreaterThan(3);
});

test('all subnetworks start and land together, then commit one point after aggregation', () => {
    for (let step = 0; step < mc.CYCLES; step++) {
        const timing = mc.ensembleTiming(step);
        expect(timing.starts).toHaveLength(10);
        expect(new Set(timing.starts).size).toBe(1);
        expect(timing.land).toBeCloseTo(timing.start + mc.TRAVEL + mc.FALL);
        expect(timing.commit).toBeGreaterThan(timing.land);
        expect(mc.plotCount(timing.start)).toBe(step);
        expect(mc.plotCount(timing.land)).toBe(step);
        expect(mc.plotCount(timing.commit - 0.001)).toBe(step);
        expect(mc.plotCount(timing.commit)).toBe(step + 1);
    }
    expect(mc.ensembleTiming(mc.CYCLES - 1).commit).toBeLessThan(mc.FADE_AT);
    expect(mc.FADE_END).toBeLessThanOrEqual(mc.DURATION - 2 / mc.FPS);
    const xs = mc.scanXs({ t0: 0, t8: 8 });
    expect(xs).toHaveLength(mc.CYCLES);
    expect(xs[0]).toBeGreaterThan(0);
    expect(xs[mc.CYCLES - 1]).toBeLessThan(8);
});

test('detected dropout paths visit only the original filled neurons', async () => {
    const pixels = await mc.loadRaw();
    const at = mc.makeAt(pixels);
    const networks = mc.detectNetworks(pixels);
    expect(networks).toHaveLength(3);
    for (const network of networks) {
        for (const layer of network.layers) {
            for (const node of layer) expect(mc.dark(at(Math.round(node.x), Math.round(node.y)))).toBe(true);
        }
        for (const edges of network.active) expect(edges.length).toBeGreaterThan(0);
    }
}, 20000);


test('a travelling packet stays behind its head, not ahead of the prediction pass', () => {
    const svg = mc.comet([[0, 0], [100, 0]], 0.5, { color: '#123456', width: 3, opacity: 1, dash: 10 });
    expect(svg).toContain('M40.0 0.0L50.0 0.0');
});


test('the faster loop uses twelve small flow steps without skipping aggregation', () => {
    expect(mc.DURATION).toBe(6);
    expect(mc.CYCLES).toBe(12);
    expect(mc.CYCLE_DT).toBeLessThan(0.5);
    const xs = mc.scanXs({ t0: 0, t8: 8 });
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeCloseTo(8 / 12);
    for (let step = 0; step < mc.CYCLES - 1; step++) {
        expect(mc.ensembleTiming(step).commit).toBeLessThan(mc.ensembleTiming(step + 1).start);
    }
});
