import Link from 'next/link';
import { ArrowRight, BarChart3, Zap, Shield, TrendingUp } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold gradient-text">Analytics SaaS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero */}
            <main className="container mx-auto px-4 pt-20 pb-32">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">AI-Powered Analytics</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Transform Data Into
                        <span className="block gradient-text">Actionable Insights</span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Enterprise-grade analytics platform with predictive insights and automated reporting.
                        Reduce reporting time by 85% with AI-powered intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="flex items-center gap-2 px-8 py-4 text-lg font-semibold text-primary-foreground gradient-primary rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Start Free Trial
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/demo"
                            className="flex items-center gap-2 px-8 py-4 text-lg font-semibold border border-border rounded-xl hover:bg-secondary transition-colors"
                        >
                            View Demo
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto">
                    {[
                        {
                            icon: TrendingUp,
                            title: 'Predictive Analytics',
                            description: 'AI-powered forecasting and trend analysis to stay ahead of the curve.',
                        },
                        {
                            icon: Zap,
                            title: 'Real-Time Dashboards',
                            description: 'Live data visualization with customizable widgets and drill-down.',
                        },
                        {
                            icon: Shield,
                            title: 'Enterprise Security',
                            description: 'SOC 2 compliant with role-based access and data encryption.',
                        },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="group p-8 rounded-2xl bg-card border border-border card-hover"
                        >
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 max-w-4xl mx-auto">
                    {[
                        { value: '85%', label: 'Time Saved' },
                        { value: '50+', label: 'Enterprise Clients' },
                        { value: '99.99%', label: 'Uptime SLA' },
                        { value: '24/7', label: 'Support' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © 2024 Analytics SaaS. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
