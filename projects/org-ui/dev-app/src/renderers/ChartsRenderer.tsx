'use client';

import {
  ChartEmptyState,
  ChartLegend,
  FieldFlowBarChart,
  FieldFlowRadialChart,
  FieldFlowTrendChart,
} from '@fieldflow360/org-ui';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

const barData = [
  { client: 'Acme Co', jobs: 42 },
  { client: 'North Field', jobs: 28 },
  { client: 'River Bend', jobs: 19 },
  { client: 'Summit Ag', jobs: 14 },
];

const trendData = [
  { month: 'Jan', jobs: 12 },
  { month: 'Feb', jobs: 18 },
  { month: 'Mar', jobs: 15 },
  { month: 'Apr', jobs: 24 },
  { month: 'May', jobs: 31 },
  { month: 'Jun', jobs: 27 },
];

const radialData = [
  { id: 'active', label: 'Active', value: 48 },
  { id: 'pending', label: 'Pending', value: 22 },
  { id: 'done', label: 'Completed', value: 64 },
  { id: 'hold', label: 'On hold', value: 9 },
];

const legendPreview = [
  { id: 'active', label: 'Active', color: 'var(--color-chart-series-1)', value: 48 },
  { id: 'pending', label: 'Pending', color: 'var(--color-chart-series-2)', value: 22 },
  { id: 'done', label: 'Completed', color: 'var(--color-chart-series-3)', value: 64 },
];

export const ChartsRenderer = () => {
  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Charts
      </h2>

      <CodePreview
        title="FieldFlowBarChart"
        code={`<FieldFlowBarChart
  data={[{ client: 'Acme', jobs: 42 }]}
  xKey="client"
  yKey="jobs"
  emptyTitle="No client data yet"
/>`}
      />

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="border-border-subtle bg-bg-surface-elevated rounded-2xl border p-5 shadow-sm">
          <h3 className="text-text-primary mb-4 text-sm font-semibold">Top clients (bar)</h3>
          <FieldFlowBarChart data={barData} xKey="client" yKey="jobs" height={220} />
        </div>
        <div className="border-border-subtle bg-bg-surface-elevated rounded-2xl border p-5 shadow-sm">
          <h3 className="text-text-primary mb-4 text-sm font-semibold">Empty bar chart</h3>
          <FieldFlowBarChart
            data={[]}
            xKey="client"
            yKey="jobs"
            height={220}
            emptyTitle="No client data yet"
            emptyDescription="Jobs by client will appear after your first records."
          />
        </div>
      </div>

      <CodePreview
        title="FieldFlowTrendChart"
        code={`<FieldFlowTrendChart
  data={trendData}
  xKey="month"
  series={[{ key: 'jobs', label: 'Jobs' }]}
/>`}
      />

      <div className="border-border-subtle bg-bg-surface-elevated mb-10 rounded-2xl border p-5 shadow-sm">
        <h3 className="text-text-primary mb-4 text-sm font-semibold">Job trend (line)</h3>
        <FieldFlowTrendChart
          data={trendData}
          xKey="month"
          series={[{ key: 'jobs', label: 'Jobs' }]}
          height={240}
        />
      </div>

      <CodePreview
        title="FieldFlowRadialChart"
        code={`<FieldFlowRadialChart
  data={[{ id: 'active', label: 'Active', value: 48 }]}
  centerLabel={{ value: '143', subtitle: 'Total jobs' }}
/>`}
      />

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="border-border-subtle bg-bg-surface-elevated rounded-2xl border p-5 shadow-sm">
          <h3 className="text-text-primary mb-4 text-sm font-semibold">Jobs by status (radial)</h3>
          <FieldFlowRadialChart
            data={radialData}
            height={260}
            centerLabel={{ value: '143', subtitle: 'Total jobs' }}
          />
        </div>
        <div className="border-border-subtle bg-bg-surface-elevated rounded-2xl border p-5 shadow-sm">
          <h3 className="text-text-primary mb-4 text-sm font-semibold">Empty radial chart</h3>
          <FieldFlowRadialChart
            data={[]}
            height={260}
            emptyTitle="No status breakdown"
            emptyDescription="Status distribution appears when jobs exist."
          />
        </div>
      </div>

      <div className="border-border-subtle bg-bg-surface-elevated rounded-2xl border p-5 shadow-sm">
        <h3 className="text-text-primary mb-4 text-sm font-semibold">Chart legend (standalone)</h3>
        <ChartLegend items={legendPreview} showValues scrollable />
        <div className="mt-6">
          <ChartEmptyState
            height={220}
            title="Custom empty state"
            description="Use ChartEmptyState for any chart slot without data."
          />
        </div>
      </div>
    </Section>
  );
};
