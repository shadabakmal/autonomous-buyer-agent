'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import AgentExecutionLog from '../../components/AgentExecutionLog';
import ProductCard from '../../components/ProductCard';
import SentimentAnalyzer from '../../components/SentimentAnalyzer';
import PriceHistoryChart from '../../components/PriceHistoryChart';
import AutoBuyModal from '../../components/AutoBuyModal';
import { runAgentTaskSimulation } from '../../lib/agentEngine';
import { MOCK_PRODUCTS, INITIAL_USER_SETTINGS } from '../../lib/mockData';
import { AgentTask, AgentStep, Product, RetailerListing, UserSettings, Order } from '../../lib/types';
import { Bot, Send, User, Sparkles, Zap, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text: string;
  task?: AgentTask;
}

function AgentChatInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get('query') : null;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<AgentStep[]>([]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_USER_SETTINGS);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerListing | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentSteps, isProcessing]);

  // Handle initial query from URL search param
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleRunAgentQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleRunAgentQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
        text: queryText,
      },
    ];

    setMessages(newMessages);
    setInputQuery('');
    setIsProcessing(true);
    setCurrentSteps([]);

    // Run simulation
    const result = await runAgentTaskSimulation(
      queryText,
      settings,
      (step, allSteps) => {
        setCurrentSteps([...allSteps]);
      }
    );

    const agentMsgId = `msg-agent-${Date.now()}`;

    let replyText = `I have finished analyzing live prices and customer reviews across major stores for "${queryText}".`;
    if (result.autoPurchased) {
      replyText = `🎉 **Autonomous Purchase Executed!** I found the best deal on **${result.selectedRetailer.name}** for **$${result.selectedRetailer.price.toFixed(2)}**. Since it satisfied all your guardrails, I automatically placed the order.`;
    } else if (result.task.status === 'waiting_approval') {
      replyText = `⚠️ **Guardrail Notice**: I found the top recommended model on **${result.selectedRetailer.name}** for **$${result.selectedRetailer.price.toFixed(2)}**, but it requires your confirmation before checkout.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: agentMsgId,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString(),
        text: replyText,
        task: result.task,
      },
    ]);

    setIsProcessing(false);
  };

  const handleOpenBuyModal = (prod: Product, ret: RetailerListing) => {
    setSelectedProduct(prod);
    setSelectedRetailer(ret);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar settings={settings} />

      <div className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100">Interactive Autonomous Buyer Chat</h1>
              <p className="text-xs text-slate-400">Prompt your agent, monitor live tool execution, and inspect AI sentiment</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Agent Online
            </span>
          </div>
        </div>

        {/* Chat Thread Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 min-h-[400px]">
          
          {/* Welcome Agent Message */}
          {messages.length === 0 && !isProcessing && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center max-w-2xl mx-auto my-12 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">What would you like your Buyer Agent to find?</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe the item, your budget, preferred brands, or price drop trigger. The agent will query retailers in real-time, cross-reference verified buyer reviews, check your safety guardrails, and recommend or auto-purchase.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                {[
                  'Find Sony WH-1000XM5 headphones under $330',
                  'Compare LG OLED TVs vs Samsung QLED',
                  'Buy Keychron mechanical keyboard with tactile switches',
                  'Find fast 200W power bank for travel',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRunAgentQuery(sample)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Loop */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`space-y-4 max-w-3xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Agent Task Details (Steppers, Product Card, Sentiment Breakdown) */}
                {msg.task && msg.task.matchedProduct && (
                  <div className="space-y-6 pt-2">
                    
                    {/* Execution Logs */}
                    <AgentExecutionLog steps={msg.task.steps} />

                    {/* Matched Product Result */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                          Agent Top Recommendation
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Best Offer: ${msg.task.selectedRetailer?.price.toFixed(2)} on {msg.task.selectedRetailer?.name}
                        </span>
                      </div>

                      <ProductCard
                        product={msg.task.matchedProduct}
                        onSelectBuy={handleOpenBuyModal}
                        onSetRule={(p) => handleOpenBuyModal(p, p.retailers[0])}
                      />

                      {/* Deep Sentiment Breakdown Component */}
                      <SentimentAnalyzer
                        sentiment={msg.task.matchedProduct.sentiment}
                        productName={msg.task.matchedProduct.name}
                      />

                      {/* Price History Chart */}
                      <PriceHistoryChart
                        priceHistory={msg.task.matchedProduct.priceHistory}
                        predictedDrop={msg.task.matchedProduct.predictedPriceDrop}
                      />
                    </div>

                  </div>
                )}

              </div>

              {msg.sender === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Live Step Progress Indicator while agent is processing */}
          {isProcessing && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Agent active — Querying storefronts & analyzing review sentiment...</span>
              </div>
              {currentSteps.length > 0 && <AgentExecutionLog steps={currentSteps} />}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunAgentQuery(inputQuery);
          }}
          className="relative flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl"
        >
          <input
            type="text"
            placeholder="Type a new request (e.g. 'Find Anker power bank under $90' or 'Compare LG OLED TV prices')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

      {/* Auto Buy Modal */}
      <AutoBuyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        retailer={selectedRetailer}
        settings={settings}
        onConfirmPurchase={(p, r) => {
          setSettings((prev) => ({
            ...prev,
            monthlySpent: prev.monthlySpent + r.price,
          }));
        }}
        onSaveRule={() => {}}
      />
    </div>
  );
}

export default function AgentChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center text-xs text-slate-400">Loading Agent Chat...</div>}>
      <AgentChatInner />
    </Suspense>
  );
}
