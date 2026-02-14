import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Server,
    Database,
    Globe,
    Zap,
    Users,
    CheckCircle2,
    ArrowRight,
    Menu,
    X,
    Play,
    Cpu,
    ShieldCheck,
    Code2,
} from 'lucide-react';

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
    {
        icon: Zap,
        title: 'AI Architecture Review',
        description:
            'Draw your design and get instant feedback on single points of failure, bottleneck analysis, and scalability concerns.',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
    },
    {
        icon: Code2,
        title: 'Interactive Scenarios',
        description:
            'Don\'t just read. Configure database sharding strategies, caching layers, and consistency models in a live sandbox environment.',
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/10',
    },
    {
        icon: ShieldCheck,
        title: 'Curated Problems',
        description:
            'From "Design TinyURL" to "Design Uber", we break down the most popular interview questions into manageable, logical steps.',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
    },
];

const STATS = [
    { value: '15k+', label: 'Active Engineers' },
    { value: '500+', label: 'Mock Interviews' },
    { value: '92%', label: 'Offer Rate' },
    { value: '24/7', label: 'AI Availability' },
];

const PRICING_TIERS = [
    {
        name: 'Starter',
        price: '$0',
        period: 'Forever free',
        features: ['5 Practice Problems', 'Basic Whiteboard', 'Community Access'],
        cta: 'Get Started',
        variant: 'outline',
        highlighted: false,
    },
    {
        name: 'Pro Architect',
        price: '$12',
        period: 'Billed annually',
        priceSuffix: '/mo',
        features: [
            'Unlimited Problems',
            'AI Architecture Reviews',
            'Interactive Sandbox',
            'Peer Mock Interviews',
        ],
        cta: 'Upgrade to Pro',
        variant: 'default',
        highlighted: true,
    },
    {
        name: 'Team',
        price: '$49',
        period: 'Per user',
        priceSuffix: '/mo',
        features: [
            'Everything in Pro',
            'Team Analytics',
            'Custom Scenarios',
            'SSO Integration',
        ],
        cta: 'Contact Sales',
        variant: 'outline',
        highlighted: false,
    },
];

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="dark">
            <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
                <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                                <Cpu className="h-5 w-5 text-white" />
                            </div>
                            <span>Architex</span>
                        </div>

                        <div className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="transition-colors hover:text-white"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <Button variant="ghost" className="text-zinc-400" asChild>
                                <Link to="/login">Log in</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/register">Get Started</Link>
                            </Button>
                        </div>

                        <button
                            type="button"
                            className="p-2 text-zinc-400 md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <div className="space-y-4 border-t border-zinc-800 bg-zinc-950 px-4 py-6 md:hidden">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="block text-sm font-medium text-zinc-400 hover:text-white"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 pt-4">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/login">Log in</Link>
                                </Button>
                                <Button className="w-full justify-start" asChild>
                                    <Link to="/register">Get Started</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </nav>

                <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
                    <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-indigo-500/20 opacity-50 blur-[120px]" />

                    <div className="container relative z-10 mx-auto px-4 md:px-6">
                        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
                            <Badge variant="secondary">
                                <span className="mr-1">🚀</span> New: Interactive Whiteboard 2.0
                            </Badge>

                            <h1 className="text-4xl font-bold tracking-tight text-white md:text-7xl">
                                Master System Design.{' '}
                                <br />
                                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                    Crush the Interview.
                                </span>
                            </h1>

                            <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
                                Stop memorizing diagrams. Start understanding scale. The only
                                platform that simulates real-world distributed systems challenges
                                with AI-powered feedback.
                            </p>

                            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
                                <Button size="lg" className="h-12 w-full gap-2 text-base sm:w-auto" asChild>
                                    <Link to="/register">
                                        Start Practicing Free <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 w-full gap-2 text-base sm:w-auto"
                                >
                                    <Play className="h-4 w-4" /> Watch Demo
                                </Button>
                            </div>

                            <div className="flex items-center gap-8 pt-12 text-sm font-medium text-zinc-500">
                                <span>Trusted by engineers at</span>
                                <div className="flex gap-6 opacity-70 transition-all grayscale hover:grayscale-0">
                                    <span className="hover:text-white">NETFLIX</span>
                                    <span className="hover:text-white">UBER</span>
                                    <span className="hover:text-white">META</span>
                                    <span className="hover:text-white">STRIPE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-10 md:px-6">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 shadow-2xl backdrop-blur-sm md:p-4">
                        <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 md:aspect-[21/9]">
                            <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] opacity-50 [background-size:16px_16px]" />

                            <div className="relative z-10 grid grid-cols-3 items-center gap-12 md:gap-24">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 shadow-lg">
                                        <Users className="h-8 w-8 text-zinc-400" />
                                    </div>
                                    <span className="font-mono text-xs text-zinc-500">
                                        Clients (10M DAU)
                                    </span>
                                </div>

                                <div className="relative flex flex-col items-center gap-2">
                                    <div className="absolute -left-12 top-1/2 h-[2px] w-12 bg-gradient-to-r from-zinc-700 to-indigo-500/50" />
                                    <div className="absolute -right-12 top-1/2 h-[2px] w-12 bg-gradient-to-r from-indigo-500/50 to-zinc-700" />

                                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
                                        <Globe className="h-10 w-10 text-indigo-400" />
                                    </div>
                                    <span className="font-mono text-xs text-indigo-400">
                                        Load Balancer
                                    </span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex h-12 w-32 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg">
                                        <Server className="h-4 w-4 text-emerald-500" />
                                        <span className="text-xs text-zinc-300">Auth Service</span>
                                    </div>
                                    <div className="flex h-12 w-32 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg">
                                        <Database className="h-4 w-4 text-amber-500" />
                                        <span className="text-xs text-zinc-300">Sharded DB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="bg-zinc-950 py-24">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid gap-8 md:grid-cols-3">
                            {FEATURES.map((feature) => (
                                <Card
                                    key={feature.title}
                                    className="group border-zinc-800 bg-zinc-950 p-6 text-zinc-50 transition-colors hover:border-zinc-700"
                                >
                                    <CardContent className="space-y-4 p-0">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}
                                        >
                                            <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                        </div>
                                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                                        <p className="leading-relaxed text-zinc-400">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-y border-zinc-900 bg-zinc-900/20 py-20">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                            {STATS.map((stat) => (
                                <div key={stat.label}>
                                    <div className="mb-2 text-4xl font-bold text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-zinc-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="pricing" className="container mx-auto px-4 py-24 md:px-6">
                    <div className="mb-16 space-y-4 text-center">
                        <h2 className="text-3xl font-bold md:text-4xl">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-zinc-400">
                            Invest in your career for less than the cost of a coffee a week.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                        {PRICING_TIERS.map((tier) => (
                            <Card
                                key={tier.name}
                                className={`relative flex flex-col overflow-hidden p-8 text-zinc-50 ${tier.highlighted
                                    ? 'border-indigo-500/50 bg-zinc-900/50'
                                    : 'border-zinc-800 bg-zinc-950'
                                    }`}
                            >
                                {tier.highlighted && (
                                    <div className="absolute top-0 right-0 rounded-bl-lg bg-indigo-500 px-3 py-1 text-xs font-bold text-white">
                                        POPULAR
                                    </div>
                                )}
                                <CardContent className="flex flex-1 flex-col p-0">
                                    <div className="mb-6">
                                        <h3
                                            className={`mb-2 text-xl font-bold ${tier.highlighted ? 'text-indigo-400' : ''
                                                }`}
                                        >
                                            {tier.name}
                                        </h3>
                                        <div className="text-3xl font-bold">
                                            {tier.price}
                                            {tier.priceSuffix && (
                                                <span className="text-lg font-normal text-zinc-500">
                                                    {tier.priceSuffix}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-zinc-500">{tier.period}</p>
                                    </div>

                                    <ul className="mb-8 flex-1 space-y-4">
                                        {tier.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className={`flex items-center gap-2 text-sm ${tier.highlighted ? 'text-zinc-200' : 'text-zinc-300'
                                                    }`}
                                            >
                                                <CheckCircle2
                                                    className={`h-4 w-4 ${tier.highlighted
                                                        ? 'text-indigo-500'
                                                        : 'text-zinc-600'
                                                        }`}
                                                />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        variant={tier.variant}
                                        className={`w-full ${tier.highlighted
                                            ? 'border-none bg-indigo-600 text-white hover:bg-indigo-700'
                                            : ''
                                            }`}
                                        asChild
                                    >
                                        <Link to="/register">{tier.cta}</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="relative overflow-hidden py-24">
                    <div className="absolute inset-0 bg-indigo-600/5" />
                    <div className="container relative z-10 mx-auto px-4 text-center md:px-6">
                        <h2 className="mb-6 text-3xl font-bold md:text-5xl">
                            Ready to design the next big thing?
                        </h2>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
                            Join thousands of engineers who used Architex to land their dream
                            roles at top tech companies.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Button
                                size="lg"
                                className="h-12 bg-white px-8 text-black hover:bg-zinc-200"
                                asChild
                            >
                                <Link to="/register">Start Designing Now</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 border-zinc-700 px-8 hover:bg-zinc-800"
                            >
                                View Roadmap
                            </Button>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-sm">
                    <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
                        <div>
                            <div className="mb-4 flex items-center gap-2 text-lg font-bold">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600">
                                    <Cpu className="h-3 w-3 text-white" />
                                </div>
                                <span>Architex</span>
                            </div>
                            <p className="text-zinc-500">
                                The modern standard for system design interview preparation.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-semibold text-white">Product</h4>
                            <a
                                href="#features"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                Features
                            </a>
                            <a
                                href="#pricing"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                Pricing
                            </a>
                            <a
                                href="#"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                Changelog
                            </a>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-semibold text-white">Resources</h4>
                            <a
                                href="#"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                Blog
                            </a>
                            <a
                                href="#"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                Documentation
                            </a>
                            <a
                                href="#"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                System Design Guide
                            </a>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h4 className="font-semibold text-white">Legal</h4>
                            <a
                                href="#"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                Privacy
                            </a>
                            <a
                                href="#"
                                className="text-zinc-500 transition-colors hover:text-white"
                            >
                                Terms
                            </a>
                        </div>
                    </div>
                    <div className="container mx-auto mt-12 border-t border-zinc-900 px-4 pt-8 text-center text-zinc-600 md:px-6">
                        © 2026 Architex Inc. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
