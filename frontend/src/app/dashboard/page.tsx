'use client';

import { useQuery } from '@tanstack/react-query';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Activity,
    BarChart2,
    ArrowUpRight,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/metric-card';
import { AreaChartWidget } from '@/components/charts/area-chart';

export default function DashboardPage() {
    const { data: overview, isLoading } = useQuery({
        queryKey: ['analytics-overview'],
        queryFn: () => api.getOverview(30),
    });

    const metrics = [
        {
            title: 'Total Events',
            value: overview?.totalEvents || 0,
            change: 12.5,
            icon: Activity,
            trend: 'up' as const,
        },
        {
            title: 'Unique Users',
            value: overview?.uniqueUsers || 0,
            change: 8.2,
            icon: Users,
            trend: 'up' as const,
        },
        {
            title: 'Avg. Session',
            value: '4m 32s',
            change: -2.1,
            icon: BarChart2,
            trend: 'down' as const,
        },
        {
            title: 'Conversion Rate',
            value: '3.24%',
            change: 15.8,
            icon: TrendingUp,
            trend: 'up' as const,
        },
    ];

    // Transform daily trend data for chart
    const chartData = overview?.dailyTrend?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseInt(item.count),
    })) || [];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-secondary rounded w-48"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-secondary rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's your analytics overview for the last 30 days.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => (
                    <MetricCard key={metric.title} {...metric} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Event Activity</h3>
                            <p className="text-sm text-muted-foreground">Daily events over time</p>
                        </div>
                        <select className="text-sm bg-background border border-input rounded-lg px-3 py-2">
                            <option>Last 30 days</option>
                            <option>Last 7 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <AreaChartWidget data={chartData} dataKey="value" />
                    </div>
                </div>

                {/* Event Types */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Top Events</h3>
                    <div className="space-y-4">
                        {(overview?.eventCounts || []).slice(0, 5).map((event: any, index: number) => (
                            <div key={event.eventType} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                            backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
                                        }}
                                    />
                                    <span className="text-sm font-medium">{event.eventType}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {formatNumber(parseInt(event.count))}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Create Dashboard', description: 'Build a custom analytics view', href: '/dashboard/dashboards/new' },
                    { title: 'Generate Report', description: 'Create and export reports', href: '/dashboard/reports' },
                    { title: 'View Predictions', description: 'AI-powered forecasts', href: '/dashboard/predictions' },
                ].map((action) => (
                    <a
                        key={action.title}
                        href={action.href}
                        className="group p-6 bg-card border border-border rounded-xl card-hover"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{action.title}</h3>
                            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}
