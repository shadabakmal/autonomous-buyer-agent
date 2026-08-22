'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Database, ShieldAlert, AlertTriangle, ArrowLeftRight, Bot } from 'lucide-react';

export default function MerchantNavbar() {
  const pathname = usePathname();

  const links = [
    { href: '/merchant', label: 'Revenue Growth', icon: TrendingUp },
    { href: '/merchant/catalog', label: 'Agentic Catalog (ACP)', icon: Database },
    { href: '/merchant/audit', label: 'Financial Audit Trail', icon: ShieldAlert },
    { href: '/failure-demo', label: 'Failure Recovery Demo', icon: AlertTriangle },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <Link href="/merchant" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-100 tracking-tight">MERCHANT REVENUE SUITE</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                RAZORPAY TEST-MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">AI Agentic Commerce & Revenue Growth</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Switch to Buyer View */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition-colors shadow-md"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>Switch to Buyer Agent</span>
        </Link>

      </div>
    </header>
  );
}
