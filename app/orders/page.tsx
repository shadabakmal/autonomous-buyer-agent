'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Order, UserSettings, formatINR } from '../../lib/types';
import { History, Bot, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const [settings, setSettings] = useState<UserSettings>({
    maxSingleItemLimit: 50000,
    monthlySpendLimit: 250000,
    monthlySpent: 64990,
    requireApprovalOver: 15000,
    autoBuyEnabled: true,
    smsNotifications: true,
    emailNotifications: true,
    preferredStores: ['Amazon India', 'Flipkart', 'Croma', 'Reliance Digital'],
    shippingAddress: {
      name: 'Alex Johnson',
      street: '742 Evergreen Terrace',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
    },
    paymentMethod: {
      type: 'Credit Card',
      last4: '4829',
      expiry: '08/28',
      brand: 'Visa Infinite',
    },
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const [ordRes, setRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/settings'),
        ]);

        const ordData = await ordRes.json();
        if (ordData && ordData.orders) {
          setOrders(
            ordData.orders.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              productId: o.productId,
              productName: o.product ? o.product.name : 'Anker Power Bank',
              productImage: o.product
                ? o.product.image
                : 'https://images.unsplash.com/photo-1609592424074-b52b2f6b43d3?w=500&auto=format&fit=crop&q=80',
              retailer: o.retailer,
              pricePaid: o.pricePaid,
              shippingCost: o.shippingCost,
              tax: o.tax,
              total: o.total,
              purchasedAt: o.purchasedAt ? new Date(o.purchasedAt).toISOString().substring(0, 16).replace('T', ' ') : '2026-08-18 14:32',
              status: o.status || 'delivered',
              trackingNumber: o.trackingNumber || 'TBA309182390192',
              estimatedDelivery: o.estimatedDelivery || '2 Days',
              agentReasoning: o.agentReasoning || 'Executed via Razorpay API',
              autoPurchased: o.autoPurchased ?? true,
            }))
          );
        }

        const setData = await setRes.json();
        if (setData && setData.settings) {
          setSettings(setData.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

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
            Autonomous Transaction Log & Invoices (INR ₹)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Order History & Receipts</h1>
          <p className="text-xs text-slate-400 mt-1">Audit log of all orders executed by your buyer agent across Indian stores</p>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60">
            <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
            <div className="text-xs font-semibold text-slate-300">Fetching order history from SQLite Database...</div>
          </div>
        ) : (
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
                    <div className="text-lg font-bold text-emerald-400 font-mono">{formatINR(ord.total)}</div>
                  </div>
                </div>

                {/* Item Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img src={ord.productImage} alt={ord.productName} className="h-20 w-20 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0" />
                  
                  <div className="flex-1 space-y-1">
                    <h3 className="font-bold text-base text-slate-100">{ord.productName}</h3>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      <span>Item Price: {formatINR(ord.pricePaid)}</span>
                      <span>GST Tax: {formatINR(ord.tax)}</span>
                      <span>Shipping: {ord.shippingCost === 0 ? 'FREE' : formatINR(ord.shippingCost)}</span>
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
        )}

      </main>
    </div>
  );
}
