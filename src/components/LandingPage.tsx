import React, { useState } from 'react';
import {
  FileText,
  Globe,
  ArrowRight,
  Shield,
  Brain,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  ChevronRight,
  Database,
  ExternalLink,
  Laptop,
  Check,
  CheckCircle,
  Clock,
  ChevronDown,
  Layers,
  ArrowDown
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onExploreDemo: () => void;
  onOpenPlans: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  onExploreDemo,
  onOpenPlans,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. Global Navigation Bar - Compact, Premium & Restrained */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-7">
            <AppLogo size="sm" showTagline={false} />
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-slate-500">
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
              <a href="#modes" className="hover:text-slate-900 transition-colors">Modes</a>
              <a href="#vault" className="hover:text-slate-900 transition-colors">Vault</a>
              <a href="#inside-fill" className="hover:text-slate-900 transition-colors">Product</a>
              <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onExploreDemo}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Demo Tour
            </button>
            <button
              onClick={onLogin}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span>Try FILL Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Intelligent Form Completion System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 font-sans leading-[1.08]">
              Your information. <br />
              <span className="text-slate-500">One time.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg font-normal">
              FILL understands what forms are asking for, matches them to your information, and helps you complete them without typing the same details again.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ring-4 ring-slate-900/5 active:scale-[0.98]"
              >
                <span>Try FILL Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDemo}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>See how it works</span>
              </button>
            </div>

            {/* Micro Trust badges */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                Zero Cloud Vault
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                Documents + Websites
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                No auto-submission
              </span>
            </div>
          </div>

          {/* Right Column: Premium Interactive Product Visualization (Hero Requirement 2) */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950 text-white p-5 sm:p-7 rounded-3xl shadow-2xl border border-slate-800/80 relative overflow-hidden">
              {/* Top window chrome */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-2">FILL Sense &bull; Semantic Pipeline</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Live Guard Active
                </span>
              </div>

              {/* Realistic Pipeline Transformation */}
              <div className="space-y-4">
                {/* 1. Form Field Input */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unfamiliar Form Prompt</span>
                    <span className="text-[10px] font-mono text-slate-500">HTML Input &lt;input name=&quot;inst_att&quot;&gt;</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200">
                    &quot;Institution presently attended&quot;
                  </div>
                </div>

                {/* Transformation Transition Arrow */}
                <div className="flex items-center justify-center gap-2 py-0.5">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono text-[10px] font-bold flex items-center gap-1">
                    <Brain className="w-3 h-3 text-indigo-400" />
                    FILL Sense Analysis
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                {/* 2. Mapped Meaning */}
                <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-200">Canonical Meaning:</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-900/80 text-white font-mono text-xs font-bold border border-indigo-700">
                        School
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                      97% confidence
                    </span>
                  </div>

                  {/* Vault Value matched */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Matched Vault Value</span>
                      <span className="text-xs font-bold text-white">Saint Patrick&apos;s College</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                      <span>🧠 Remembered by FILL</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-bar indicator */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Zero manual typing needed</span>
                <span className="text-emerald-400 font-semibold">Ready for review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 2: The Problem */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">The Problem</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              Repetitive form filling wastes hours.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Applying for fellowships, scholarships, university programs, and grants requires re-typing the same core details across dozens of poorly designed portals.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {[
              { label: 'Full Legal Name', count: '100+ times' },
              { label: 'Primary Email', count: '100+ times' },
              { label: 'Educational Institution', count: '85+ times' },
              { label: 'Programme / Course', count: '80+ times' },
              { label: 'Phone & Coordinates', count: '75+ times' },
              { label: 'Graduation Year', count: '70+ times' },
            ].map((f) => (
              <div key={f.label} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{f.label}</span>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded block">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Interactive Product Widgets Section (Section 3 & 4) */}
      <section id="vault" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">Built-in Intelligence</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              How FILL operates under the hood.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Four interconnected modules power every application you complete.
            </p>
          </div>

          {/* Interactive Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WIDGET 1: VAULT */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">FILL Vault</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Protected
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="font-bold text-slate-800">Alex Rivera</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="font-bold text-slate-800">alex@example.com</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between">
                    <span className="text-slate-400">Educational institution</span>
                    <span className="font-bold text-slate-800">Saint Patrick&apos;s College</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between">
                    <span className="text-slate-400">Course / programme</span>
                    <span className="font-bold text-slate-800">Computer Science</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Your information stays under your control. Never uploaded to unencrypted public databases.
              </div>
            </div>

            {/* WIDGET 2: FILL SENSE */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">FILL Sense</h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Semantic Matching
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Form Field</span>
                    <span className="font-semibold text-slate-800">&quot;Institution presently attended&quot;</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-xs">
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>FILL Sense maps to</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
                    <span className="font-bold text-indigo-950">School</span>
                    <span className="text-[11px] font-bold text-emerald-700">97% confidence</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Understands intent and phrasing variations across international forms.
              </div>
            </div>

            {/* WIDGET 3: MEMORY */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧠</span>
                    <h3 className="text-sm font-bold text-slate-900">FILL Memory</h3>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Confirmed Learning
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Previously Confirmed</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>&quot;Institution presently attended&quot;</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-indigo-700">School</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Remembered by FILL
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Confirm once, recognized forever across all subsequent applications.
              </div>
            </div>
          </div>

          {/* Activity Widget & Chrome Companion Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WIDGET 4: ACTIVITY (Demo Data on Website Only) */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Applications Stream</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Demo</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Scholarship Application</span>
                    <span className="text-[11px] text-slate-500">Global Merit Fellowship</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ 7 fields completed
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">University Registration</span>
                    <span className="text-[11px] text-slate-500">Postgraduate Intake Form</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ 12 fields completed
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Internship Application</span>
                    <span className="text-[11px] text-slate-500">Software Fellowship Program</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ 9 fields completed
                  </span>
                </div>
              </div>
            </div>

            {/* WIDGET 5: CHROME COMPANION */}
            <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">FILL for Chrome</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Ready to connect
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Fill forms directly on websites. Manifest V3 companion scans inputs, matches meaning to your Vault, and populates safely with one click.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={onGetStarted}
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Connect Chrome</span>
                </button>

                <a
                  href="/demo.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <span>Interactive Web Demo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 5: Documents + Websites (Two Product Modes) */}
      <section id="modes" className="py-20 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">Two First-Class Modes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              One brain. Two ways to use it.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Choose either one or both. Powered by the same Vault, Sense, Memory, and Guard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode 1: Documents */}
            <div className="p-7 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">📄 Documents Mode</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload PDFs, scans, photos, or digital application forms. FILL analyzes field layout, matches questions to your Vault, and generates completed PDF exports.
                </p>
              </div>

              <button
                onClick={onGetStarted}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Upload a Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode 2: Websites */}
            <div className="p-7 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-sans">🌐 Websites Mode</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete forms on any web page. The FILL Chrome Extension injects directly into inputs, understands variations in label wording, and never auto-submits.
                </p>
              </div>

              <button
                onClick={onGetStarted}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Connect Chrome Companion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 6: Large Interactive "Inside FILL" Product Showcase (Requirement 5) */}
      <section id="inside-fill" className="py-20 bg-white border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">Product Showcase</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              Inside the authenticated FILL workspace.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A real personal command center for your applications.
            </p>
          </div>

          {/* Mini-Dashboard Mockup Shell */}
          <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Mini Sidebar */}
              <div className="md:col-span-3 bg-slate-900 rounded-2xl p-4 space-y-4 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <AppLogo size="sm" showTagline={false} />
                  <span className="text-[10px] font-mono text-slate-400">Workspace</span>
                </div>
                <div className="space-y-1 text-slate-300 font-semibold">
                  <div className="px-3 py-2 rounded-xl bg-white/10 text-white font-bold flex items-center justify-between">
                    <span>Home</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors">Vault</div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors">Forms</div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors">Memory</div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors">Chrome</div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors">Plans</div>
                </div>
              </div>

              {/* Mini Dashboard Content */}
              <div className="md:col-span-9 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Good to see you, Alex.</h3>
                    <p className="text-xs text-slate-400">Your personal information workspace is ready.</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                    Vault Encrypted
                  </span>
                </div>

                {/* Two Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">📄 Fill a Document</span>
                      <span className="text-[11px] text-slate-400">PDF, scan, or form snapshot</span>
                    </div>
                    <button
                      onClick={onGetStarted}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-950 font-bold text-xs"
                    >
                      Start
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">🌐 Fill a Website</span>
                      <span className="text-[11px] text-slate-400">In-browser autofill</span>
                    </div>
                    <button
                      onClick={onGetStarted}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
                    >
                      Open
                    </button>
                  </div>
                </div>

                {/* 4 Status Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Forms Completed</span>
                    <span className="text-xl font-bold text-white">12</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vault Fields</span>
                    <span className="text-xl font-bold text-indigo-400">18 / 18</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Memory Mappings</span>
                    <span className="text-xl font-bold text-white">7 learned</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Chrome Status</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-1">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section 7: Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase">Plans & Billing</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              Simple, transparent pricing.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Start free with core capabilities or unlock unlimited applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900 font-sans">FILL Free</h3>
                  <span className="text-xs font-bold text-slate-500">$0 / month</span>
                </div>
                <p className="text-xs text-slate-600">For students starting competitive applications.</p>
                <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> 5 completed forms every month</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Complete personal Vault storage</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Deterministic semantic matching</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600" /> Basic FILL Memory</li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                    <span>FILL Pro</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Unlimited</span>
                  </h3>
                  <span className="text-xs font-bold text-indigo-300">RevenueCat Managed</span>
                </div>
                <p className="text-xs text-slate-300">For active applicants submitting multiple scholarships & grants.</p>
                <ul className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited form completion</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Priority Gemini 3.8 Flash semantic AI</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Expanded FILL Memory</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Full Chrome Companion capabilities</li>
                </ul>
              </div>
              <button
                onClick={onOpenPlans}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-colors cursor-pointer"
              >
                View Plans & Upgrade
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Start filling smarter.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Save your information once. Let FILL complete your next scholarship, fellowship, or collegiate application.
          </p>
          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-xl cursor-pointer"
            >
              Try FILL Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200 text-xs text-slate-500 text-center">
        <p>&copy; {new Date().getFullYear()} FILL &bull; Your information. One time. All rights reserved.</p>
      </footer>
    </div>
  );
};
