'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, ShieldCheck, ShoppingCart, Sliders, Zap, History, Scale } from 'lucide-react';
import { UserSettings } from '../lib/types';

interface NavbarProps {
  settings: UserSettings;
}

export default function Navbar({ settings }: NavbarProps) {
  const pathname = usePathname();

  const remainingBudget = settings.monthlySpendLimit - settings.monthlySpent;
  const budgetPercentage = Math.min(100, Math.round((settings.monthlySpent / settings.monthlySpendLimit) * 100));

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Zap },
    { href: '/agent', label: 'Agent Chat', icon: Bot },
    { href: '/compare', label: 'Price & Sentiment', icon: Scale },
    { href: '/watchlists', label: 'Auto-Buy Rules', icon: Sliders },
    { href: '/orders', label: 'Purchases', icon: History },
    { href: '/settings', label: 'Guardrails', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Bot className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-100 tracking-tight">AUTOBUP</span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                AI AGENT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Autonomous Buyer Assistant</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Budget & Status */}
        <div className="flex items-center gap-4">
          {/* Monthly Budget Guardrail Widget */}
          <div className="hidden sm:flex flex-col items-end bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Monthly Cap:</span>
              <span className="font-semibold text-slate-200">${settings.monthlySpendLimit}</span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-emerald-400 font-medium">${remainingBudget.toFixed(0)} left</span>
            </div>
            <div className="mt-1 w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 85
                    ? 'bg-rose-500'
                    : budgetPercentage > 60
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>

          {/* Wallet / Guardrail Badge */}
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition-colors"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="hidden lg:inline">Guardrails Active</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
