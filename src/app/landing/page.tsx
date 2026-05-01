"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Database,
  Map,
  FileCheck,
  BarChart3,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Fuel,
  ShoppingBag,
  Hotel,
  Landmark,
  Globe,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#2C2C2A]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* SECTION 1: HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center">
            <Image
              src="/steinwall-logo.jpg"
              alt="Steinwall"
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div className="group relative">
              <button className="flex items-center gap-1 text-[14px] text-[#5F5E5A] hover:text-[#185FA5] transition-colors cursor-pointer">
                Platform <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <a href="#problem" className="block px-3 py-2 text-[14px] text-[#5F5E5A] hover:text-[#185FA5] hover:bg-[#E6F1FB] rounded-lg transition-colors">The Problem</a>
                <a href="#how-it-works" className="block px-3 py-2 text-[14px] text-[#5F5E5A] hover:text-[#185FA5] hover:bg-[#E6F1FB] rounded-lg transition-colors">How It Works</a>
                <a href="#modules" className="block px-3 py-2 text-[14px] text-[#5F5E5A] hover:text-[#185FA5] hover:bg-[#E6F1FB] rounded-lg transition-colors">Features</a>
              </div>
            </div>
            <a href="#use-cases" className="text-[14px] text-[#5F5E5A] hover:text-[#185FA5] transition-colors">Solutions</a>
            <a href="#metrics" className="text-[14px] text-[#5F5E5A] hover:text-[#185FA5] transition-colors">Resources</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="px-4 py-2 text-[14px] text-[#185FA5] hover:bg-[#E6F1FB] rounded-lg transition-colors font-medium">
              Log In
            </Link>
            <a href="#cta" className="px-5 py-2.5 text-[14px] bg-[#185FA5] text-white rounded-lg hover:bg-[#0C447C] transition-colors font-medium">
              Book Demo
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#5F5E5A] hover:text-[#185FA5] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3">
            <a href="#problem" className="text-[15px] text-[#5F5E5A] py-2" onClick={() => setMobileMenuOpen(false)}>The Problem</a>
            <a href="#how-it-works" className="text-[15px] text-[#5F5E5A] py-2" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#modules" className="text-[15px] text-[#5F5E5A] py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#use-cases" className="text-[15px] text-[#5F5E5A] py-2" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Link href="/" className="flex-1 text-center px-4 py-2.5 text-[14px] text-[#185FA5] border border-[#185FA5] rounded-lg font-medium">Log In</Link>
              <a href="#cta" className="flex-1 text-center px-4 py-2.5 text-[14px] bg-[#185FA5] text-white rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Book Demo</a>
            </div>
          </div>
        )}
      </header>

      {/* SECTION 2: HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-[40px] sm:text-[48px] leading-[1.15] text-[#185FA5] mb-6"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            Decarbonization Strategy That Auditors Can Verify
          </h1>
          <p className="text-[18px] sm:text-[20px] leading-[1.6] text-[#5F5E5A] max-w-2xl mx-auto mb-10">
            Transform sustainability from compliance theater into real execution.
            Board-approved. Data-ready. Audit-proof.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#cta"
              className="px-8 py-4 bg-[#185FA5] text-white rounded-xl text-[16px] font-medium hover:bg-[#0C447C] transition-colors inline-flex items-center gap-2"
            >
              Book Demo <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/"
              className="px-8 py-4 border border-[#185FA5] text-[#185FA5] rounded-xl text-[16px] font-medium hover:bg-[#E6F1FB] transition-colors"
            >
              Get Started Free
            </Link>
          </div>
          <p className="mt-8 text-[14px] text-[#888780]">
            Trusted by mid-cap manufacturers, energy companies, and retail groups across Malaysia
          </p>
        </div>
      </section>

      {/* SECTION 3: THE REAL PROBLEM */}
      <section id="problem" className="py-20 px-6 bg-[#F7F6F3]">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-8"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            Your Sustainability Strategy Is Held Hostage By A Simple Question
          </h2>
          <div className="text-[16px] leading-[1.75] text-[#5F5E5A] space-y-4">
            <p>
              Companies know net-zero is mandatory. They know auditors are coming.
              But they&apos;re frozen: What&apos;s actually material to our business?
              Which Scope 3 hotspot should we prioritize?
              How do we prove our strategy is real, not just nice-sounding targets?
            </p>
            <p className="text-[#2C2C2A] font-medium">When unsolved:</p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#854F0B] shrink-0 mt-0.5" />
                <span>Panic-hire Big 4 at RM 1.5–2M — slow, expensive, disconnected</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#854F0B] shrink-0 mt-0.5" />
                <span>Strategy stays in slides while execution goes sideways</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#854F0B] shrink-0 mt-0.5" />
                <span>Auditors find gaps: &quot;Your plan doesn&apos;t match your emissions&quot;</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#854F0B] shrink-0 mt-0.5" />
                <span>Board has no visibility into actual progress</span>
              </li>
            </ul>
          </div>

          <div className="mt-10 bg-[#FAEEDA] border border-[#E8D5B0] rounded-xl p-5">
            <p className="text-[15px] text-[#854F0B] font-medium">
              800+ Malaysian companies entering NFRS compliance in 2026–2027.
              The window to prepare is closing.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW STEINWALL SOLVES IT */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-4 text-center"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            From &ldquo;What&apos;s Our Target?&rdquo; To &ldquo;Here&apos;s Our Execution Plan&rdquo; In 4 Months
          </h2>
          <p className="text-[16px] text-[#5F5E5A] text-center mb-14 max-w-2xl mx-auto">
            Four structured phases take you from zero to audit-ready.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Materiality Assessment",
                subtitle: "Identify what actually matters",
                color: "bg-[#E6F1FB]",
                borderColor: "border-[#B8D4EF]",
                iconColor: "text-[#185FA5]",
                icon: Shield,
                points: [
                  "NFRS-aligned questionnaire guides you",
                  "Financial impact scoring (not guessing)",
                  "Scope 1, 2, 3 prioritization",
                ],
                timeline: "Board-approved in 4 weeks",
              },
              {
                step: "2",
                title: "Emissions Baseline",
                subtitle: "Systematize data from every department",
                color: "bg-[#E1F5EE]",
                borderColor: "border-[#A8DFC9]",
                iconColor: "text-[#0F6E56]",
                icon: Database,
                points: [
                  "Department-by-department inputs",
                  "S3 hotspot analysis",
                  "Data quality scoring (verified vs estimated)",
                ],
                timeline: "Audit-ready in 8 weeks",
              },
              {
                step: "3",
                title: "Strategy Builder",
                subtitle: "Translate findings into action plans",
                color: "bg-[#FAEEDA]",
                borderColor: "border-[#E8D5B0]",
                iconColor: "text-[#854F0B]",
                icon: Map,
                points: [
                  "Science-based target guidance",
                  "Procurement strategy",
                  "Action plan with owners + timeline",
                ],
                timeline: "Board presentation auto-generated",
              },
              {
                step: "4",
                title: "Audit-Ready Export",
                subtitle: "One ZIP file for auditors",
                color: "bg-[#E8F5E9]",
                borderColor: "border-[#A5D6A7]",
                iconColor: "text-[#2E7D32]",
                icon: FileCheck,
                points: [
                  "Board decisions documented",
                  "Data provenance trail",
                  "NFRS-ready reporting format",
                ],
                timeline: "Complete in 4 months total",
              },
            ].map((phase) => (
              <div
                key={phase.step}
                className={`${phase.color} ${phase.borderColor} border rounded-xl p-6 relative`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <phase.icon className={`w-4 h-4 ${phase.iconColor}`} />
                  </div>
                  <span className="text-[12px] font-semibold text-[#888780] uppercase tracking-wider">
                    Phase {phase.step}
                  </span>
                </div>
                <h3
                  className="text-[18px] text-[#2C2C2A] mb-1"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
                >
                  {phase.title}
                </h3>
                <p className="text-[14px] text-[#5F5E5A] mb-4">{phase.subtitle}</p>
                <ul className="space-y-2 mb-4">
                  {phase.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[13px] text-[#5F5E5A]">
                      <CheckCircle2 className={`w-4 h-4 ${phase.iconColor} shrink-0 mt-0.5`} />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="text-[13px] font-medium text-[#2C2C2A]">{phase.timeline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: USE CASES */}
      <section id="use-cases" className="py-20 px-6 bg-[#F7F6F3]">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-4 text-center"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            This Solves For...
          </h2>
          <p className="text-[16px] text-[#5F5E5A] text-center mb-14 max-w-2xl mx-auto">
            Industry-specific climate strategy for Malaysian companies facing NFRS compliance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                industry: "Manufacturing",
                headline: "500+ employees, complex supply chain",
                problem: "Scope 3 is 70% of emissions but we don't know where",
                solution: "Supplier emissions assessment → green procurement shift → auditor-ready proof",
                outcome: "40% S3 reduction in 18 months without capital outlay",
              },
              {
                icon: Fuel,
                industry: "Energy / Oil & Gas",
                headline: "Investor pressure, carbon tax incoming",
                problem: "Carbon tax kicks in 2026 and we need to show credible pathway",
                solution: "Science-based target validation → execution accountability → regulatory proof",
                outcome: "RM50M+ in stranded asset risk mitigated",
              },
              {
                icon: ShoppingBag,
                industry: "Retail / Consumer",
                headline: "100+ outlets, global ESG commitments",
                problem: "Board approved net-zero 2050 but no one knows what that means for us",
                solution: "Materiality-driven strategy → store-level action plans → unified reporting",
                outcome: "Every store manager knows what to decarbonize and why",
              },
              {
                icon: Hotel,
                industry: "Hospitality / Property",
                headline: "Asset-heavy, scope 1 + 2 focus",
                problem: "Energy costs rising + ESG investors demand transparency",
                solution: "Energy baseline → efficiency roadmap → verified progress tracking",
                outcome: "Energy costs down 20%, ESG score up, investor confidence restored",
              },
              {
                icon: Landmark,
                industry: "Financial Services",
                headline: "Portfolio emissions reporting",
                problem: "Client portfolio emissions are 10x their own, need intelligence",
                solution: "Client emissions data collection → materiality assessment → portfolio risk scoring",
                outcome: "Risk-adjusted financing informed by verified climate data",
              },
              {
                icon: Globe,
                industry: "Government / GLCs",
                headline: "Accountability to stakeholders",
                problem: "Must show credible decarbonization, constrained budget",
                solution: "Low-cost strategy building → community impact tracking → transparent reporting",
                outcome: "Legitimacy + budget efficiency in sustainability operations",
              },
            ].map((card) => (
              <div
                key={card.industry}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#E6F1FB] rounded-lg flex items-center justify-center">
                    <card.icon className="w-5 h-5 text-[#185FA5]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#2C2C2A]">{card.industry}</h3>
                    <p className="text-[12px] text-[#888780]">{card.headline}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#A32D2D] mb-1">Problem</p>
                    <p className="text-[14px] text-[#5F5E5A]">{card.problem}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#185FA5] mb-1">Solution</p>
                    <p className="text-[14px] text-[#5F5E5A]">{card.solution}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#0F6E56] mb-1">Outcome</p>
                    <p className="text-[14px] text-[#0F6E56] font-medium">{card.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: THE PRODUCT (5 Modules) */}
      <section id="modules" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-4 text-center"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            One Platform. Governance. Data. Execution. Proof.
          </h2>
          <p className="text-[16px] text-[#5F5E5A] text-center mb-14 max-w-2xl mx-auto">
            Five integrated modules that take you from strategy to audit-ready compliance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                module: "Materiality Assessment",
                tagline: "Identify what actually matters",
                description: "Interactive canvas + financial impact scoring + board approval workflow",
                outcome: "Board-approved materiality in 4 weeks",
                color: "bg-[#E6F1FB]",
                accent: "text-[#185FA5]",
              },
              {
                module: "Scope 1, 2, 3 Collection",
                tagline: "Systematize emissions data",
                description: "Department inputs + S3 supplier module + data validation + hotspot analysis",
                outcome: "Audit-ready baseline in 8 weeks",
                color: "bg-[#E1F5EE]",
                accent: "text-[#0F6E56]",
              },
              {
                module: "Strategy Builder",
                tagline: "Build decarbonization roadmap",
                description: "Science-based targets + action plan canvas + board presentation generator",
                outcome: "Board-approved strategy in 12 weeks",
                color: "bg-[#FAEEDA]",
                accent: "text-[#854F0B]",
              },
              {
                module: "Audit Trail",
                tagline: "Document every decision",
                description: "Decision timeline + data provenance + methodology scorecard + export",
                outcome: "One-click audit pack for board review",
                color: "bg-[#E8F5E9]",
                accent: "text-[#2E7D32]",
              },
              {
                module: "Dashboard",
                tagline: "See progress in real-time",
                description: "Status tracker + KPIs + activity log + team management",
                outcome: "Board visibility into quarterly progress",
                color: "bg-[#F3E8FF]",
                accent: "text-[#7C3AED]",
              },
            ].map((m) => (
              <div
                key={m.module}
                className={`${m.color} rounded-xl p-6 border border-transparent hover:border-gray-200 transition-colors`}
              >
                <h3
                  className={`text-[18px] ${m.accent} mb-1`}
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
                >
                  {m.module}
                </h3>
                <p className="text-[14px] text-[#5F5E5A] italic mb-3">{m.tagline}</p>
                <p className="text-[14px] text-[#5F5E5A] mb-4">{m.description}</p>
                <p className={`text-[13px] font-medium ${m.accent}`}>{m.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: INTEGRATIONS */}
      <section className="py-16 px-6 bg-[#F7F6F3]">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-6"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            Bring All Your Sustainability Data Together
          </h2>
          <p className="text-[16px] text-[#5F5E5A] mb-10 max-w-xl mx-auto">
            Steinwall is the center. You bring your data to us. We calculate, score, document, and export.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center w-48">
              <p className="text-[13px] text-[#888780] mb-1">Data Sources</p>
              <p className="text-[14px] text-[#2C2C2A] font-medium">ERP, Finance, Ops</p>
            </div>
            <div className="hidden sm:block w-12 h-0.5 bg-[#185FA5]" />
            <div className="sm:hidden h-8 w-0.5 bg-[#185FA5]" />
            <div className="bg-[#185FA5] rounded-xl px-8 py-5 text-center w-56 shadow-lg">
              <p className="text-[13px] text-[#B8D4EF] mb-1">Intelligence Layer</p>
              <p className="text-[16px] text-white font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Steinwall
              </p>
            </div>
            <div className="hidden sm:block w-12 h-0.5 bg-[#185FA5]" />
            <div className="sm:hidden h-8 w-0.5 bg-[#185FA5]" />
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center w-48">
              <p className="text-[13px] text-[#888780] mb-1">Outputs</p>
              <p className="text-[14px] text-[#2C2C2A] font-medium">Audit, Greenly, Cascade</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: SOCIAL PROOF — METRICS */}
      <section id="metrics" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-14 text-center"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            Malaysian Companies Are Preparing For 2026
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: "800+",
                label: "Main Board companies entering NFRS compliance",
                context: "Next 18 months",
                color: "bg-[#E6F1FB]",
                accent: "text-[#185FA5]",
              },
              {
                number: "RM 1.5–2M",
                label: "Average cost of Big 4 compliance engagement",
                context: "6 months per company",
                color: "bg-[#E1F5EE]",
                accent: "text-[#0F6E56]",
              },
              {
                number: "RM 30–40K",
                label: "What companies pay monthly for a smarter solution",
                context: "vs RM 1.5M lump sum",
                color: "bg-[#FAEEDA]",
                accent: "text-[#854F0B]",
              },
              {
                number: "4 months",
                label: "From no strategy to audit-ready with Steinwall",
                context: "vs 6+ months with consultants",
                color: "bg-[#E8F5E9]",
                accent: "text-[#2E7D32]",
              },
            ].map((metric) => (
              <div key={metric.number} className={`${metric.color} rounded-xl p-6 text-center`}>
                <p
                  className={`text-[36px] sm:text-[40px] ${metric.accent} mb-2`}
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
                >
                  {metric.number}
                </p>
                <p className="text-[14px] text-[#2C2C2A] font-medium mb-2">{metric.label}</p>
                <p className="text-[13px] text-[#888780]">{metric.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: TESTIMONIALS */}
      <section className="py-20 px-6 bg-[#F7F6F3]">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-14 text-center"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            Real Companies. Real Results.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Before Steinwall, our sustainability strategy was PowerPoints that no one actually executed. With Steinwall, we have board-approved targets, auditor-ready documentation, and clear supplier accountability. Our Big 4 audit took 40% less time and cost.",
                role: "VP Sustainability",
                company: "Large Energy Company, Malaysia",
              },
              {
                quote:
                  "We were staring down an RM 1.5M Big 4 engagement. Instead, we used Steinwall to build our strategy ourselves, then hired a mid-market auditor for verification. Cost was RM 300K total. Our board has more confidence because we actually understand our plan now.",
                role: "CFO",
                company: "Large Manufacturing, Malaysia",
              },
              {
                quote:
                  "The materiality assessment changed everything. It showed us that our Scope 3 (supply chain) was the leverage point, not energy efficiency. We shifted spend accordingly and now know exactly what to ask suppliers.",
                role: "Sustainability Director",
                company: "National Retail Chain, Malaysia",
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 relative">
                <div className="text-[48px] text-[#185FA5] leading-none mb-2 opacity-30" style={{ fontFamily: "serif" }}>
                  &ldquo;
                </div>
                <p className="text-[14px] leading-[1.75] text-[#5F5E5A] mb-6">{t.quote}</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-[14px] font-semibold text-[#2C2C2A]">{t.role}</p>
                  <p className="text-[13px] text-[#888780]">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: CTA / THE CHOICE */}
      <section id="cta" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[28px] sm:text-[32px] leading-[1.25] text-[#185FA5] mb-14 text-center"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
          >
            Two Scenarios. One Decision.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#854F0B]" />
                <h3
                  className="text-[20px] text-[#854F0B]"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
                >
                  Without Steinwall
                </h3>
              </div>
              <ul className="space-y-3 text-[15px] text-[#5F5E5A]">
                <li className="flex items-start gap-2">
                  <span className="text-[#A32D2D] mt-1">&#x2717;</span>
                  <span>August 2026: 800 companies panic. All hire Big 4.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A32D2D] mt-1">&#x2717;</span>
                  <span>Big 4 is booked solid. You hire a mid-market auditor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A32D2D] mt-1">&#x2717;</span>
                  <span>6 months of chaos, RM 1.5M spent, strategy is still disconnected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#A32D2D] mt-1">&#x2717;</span>
                  <span>Auditor finds gaps. Rework. Last-minute compliance theater.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#0F6E56]" />
                <h3
                  className="text-[20px] text-[#0F6E56]"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
                >
                  With Steinwall
                </h3>
              </div>
              <ul className="space-y-3 text-[15px] text-[#5F5E5A]">
                <li className="flex items-start gap-2">
                  <span className="text-[#0F6E56] mt-1">&#x2713;</span>
                  <span>January 2025: Start building on Steinwall.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F6E56] mt-1">&#x2713;</span>
                  <span>By April: Board-approved strategy, audit-ready data, execution plan locked.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F6E56] mt-1">&#x2713;</span>
                  <span>By August 2026: Compliance is proof of real execution, not panic.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0F6E56] mt-1">&#x2713;</span>
                  <span>Auditor verification takes 8 weeks, not 24. You&apos;re ahead of 800 companies.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:hello@steinwall.com?subject=Demo%20Request"
                className="px-10 py-4 bg-[#185FA5] text-white rounded-xl text-[16px] font-medium hover:bg-[#0C447C] transition-colors inline-flex items-center gap-2"
              >
                Start Building Now <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@steinwall.com?subject=Demo%20Request"
                className="px-10 py-4 border border-[#185FA5] text-[#185FA5] rounded-xl text-[16px] font-medium hover:bg-[#E6F1FB] transition-colors"
              >
                Book Demo
              </a>
            </div>
            <p className="mt-6 text-[14px] text-[#888780]">
              Still managing sustainability in slides? Your auditor won&apos;t accept that.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 11: FOOTER */}
      <footer className="bg-[#1A2332] text-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-[14px] font-semibold text-white mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#how-it-works" className="text-[14px] text-gray-400 hover:text-white transition-colors">Platform Overview</a></li>
                <li><a href="#modules" className="text-[14px] text-gray-400 hover:text-white transition-colors">All Modules</a></li>
                <li><a href="#how-it-works" className="text-[14px] text-gray-400 hover:text-white transition-colors">Product Tour</a></li>
                <li><a href="#cta" className="text-[14px] text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#cta" className="text-[14px] text-gray-400 hover:text-white transition-colors">Book Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-white mb-4 uppercase tracking-wider">Solutions</h4>
              <ul className="space-y-2.5">
                <li><a href="#use-cases" className="text-[14px] text-gray-400 hover:text-white transition-colors">Manufacturing</a></li>
                <li><a href="#use-cases" className="text-[14px] text-gray-400 hover:text-white transition-colors">Energy / Oil & Gas</a></li>
                <li><a href="#use-cases" className="text-[14px] text-gray-400 hover:text-white transition-colors">Retail / Consumer</a></li>
                <li><a href="#use-cases" className="text-[14px] text-gray-400 hover:text-white transition-colors">Financial Services</a></li>
                <li><a href="#use-cases" className="text-[14px] text-gray-400 hover:text-white transition-colors">NFRS Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-white mb-4 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="#metrics" className="text-[14px] text-gray-400 hover:text-white transition-colors">Blog / Insights</a></li>
                <li><a href="#metrics" className="text-[14px] text-gray-400 hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#metrics" className="text-[14px] text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#metrics" className="text-[14px] text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors">About Steinwall</a></li>
                <li><a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors">Our Team</a></li>
                <li><a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors">Privacy / Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/steinwall-logo.jpg"
                alt="Steinwall"
                width={100}
                height={30}
                className="h-7 w-auto"
              />
              <span className="text-[14px] text-gray-400">&copy; 2025 Steinwall. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[13px] text-gray-500 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-[13px] text-gray-500 hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
