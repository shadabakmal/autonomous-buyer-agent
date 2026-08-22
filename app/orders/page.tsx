'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { INITIAL_ORDERS, INITIAL_USER_SETTINGS } from '../../lib/mockData';
import { Order, UserSettings } from '../../lib/types';
import { History, Package, Truck, CheckCircle2, Bot, ExternalLink, Receipt } from 'lucide-react';

export default function OrdersPage() {
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [settings] = useState<UserSettings>(INITIAL_USER_SETTINGS);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'shipped':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar settings={settings} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <History className="h-4 w-4" />
            Autonomous Transaction Log & Invoices
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Order History & Receipts</h1>
          <p className="text-xs text-slate-400 mt-1">Audit log of all orders executed by your buyer agent</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((ord) => (
            <div key={ord.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
              
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-100">{ord.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase ${getStatusBadge(ord.status)}`}>
                      {ord.status}
                    </span>
                    {ord.autoPurchased && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                        <Bot className="h-3 w-3" /> Auto-Purchased
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Purchased on {ord.purchasedAt} via {ord.retailer}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Billed</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">${ord.total.toFixed(2)}</div>
                </div>
              </div>

              {/* Item Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img src={ord.productImage} alt={ord.productName} className="h-20 w-20 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0" />
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-base text-slate-100">{ord.productName}</h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>Item Price: ${ord.pricePaid.toFixed(2)}</span>
                    <span>Tax: ${ord.tax.toFixed(2)}</span>
                    <span>Shipping: {ord.shippingCost === 0 ? 'FREE' : `$${ord.shippingCost.toFixed(2)}`}</span>
                  </div>
                </div>

                {/* Delivery Tracking Code */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs space-y-1 font-mono min-w-[200px]">
                  <div className="text-[10px] text-slate-500 uppercase">Tracking Number</div>
                  <div className="font-bold text-cyan-400 truncate">{ord.trackingNumber}</div>
                  <div className="text-[10px] text-slate-400">Est. Delivery: {ord.estimatedDelivery}</div>
                </div>
              </div>

              {/* Agent Reasoning Box */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-300">
                <strong className="text-cyan-400 font-semibold">Agent Reasoning Log: </strong>
                <span>{ord.agentReasoning}</span>
              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
