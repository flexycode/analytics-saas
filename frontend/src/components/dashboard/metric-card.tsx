import { cn, formatNumber, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: LucideIcon;
    trend: 'up' | 'down';
}

export function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
    return (
        <div className="relative bg-card border border-border rounded-xl p-6 card-hover overflow-hidden">
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div
                        className={cn(
                            'flex items-center gap-1 text-sm font-medium',
                            trend === 'up' ? 'text-green-500' : 'text-red-500'
                        )}
                    >
                        {trend === 'up' ? (
                            <TrendingUp className="h-4 w-4" />
                        ) : (
                            <TrendingDown className="h-4 w-4" />
                        )}
                        {formatPercentage(Math.abs(change))}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold">
                        {typeof value === 'number' ? formatNumber(value) : value}
                    </p>
                </div>
            </div>
        </div>
    );
}
