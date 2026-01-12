'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const passwordRequirements = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
        { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
        { label: 'One number', met: /\d/.test(formData.password) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!passwordRequirements.every((r) => r.met)) {
            setError('Please meet all password requirements');
            return;
        }

        try {
            await register(formData.email, formData.password, formData.firstName, formData.lastName);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <BarChart3 className="h-10 w-10 text-primary" />
                        <span className="text-2xl font-bold gradient-text">Analytics SaaS</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create your account</h1>
                    <p className="text-muted-foreground">Start your 14-day free trial</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-8 shadow-lg">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="mt-2 space-y-1">
                            {passwordRequirements.map((req) => (
                                <div key={req.label} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-500' : 'text-muted-foreground'}`}>
                                    <Check className={`h-3 w-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                                    {req.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 text-primary-foreground font-semibold gradient-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
