"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lock, Zap, Shield, Users, Cpu, Cloud, Code2, Palette, Database, ShieldCheck, Sparkles, Brain, Rocket, Star, Layers, Globe } from "lucide-react"

export default function LearnMorePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  const technologies = [
    {
      icon: Code2,
      title: "Next.js 15",
      description: "Modern React framework with cutting-edge features and performance optimization",
      gradient: "from-cyan-500/20 to-blue-500/20",
      hoverGradient: "from-cyan-500/30 to-blue-500/30",
      glowColor: "shadow-cyan-500/25",
    },
    {
      icon: Palette,
      title: "Tailwind CSS",
      description: "Utility-first CSS framework for rapid, responsive UI development",
      gradient: "from-purple-500/20 to-pink-500/20",
      hoverGradient: "from-purple-500/30 to-pink-500/30",
      glowColor: "shadow-purple-500/25",
    },
    {
      icon: Sparkles,
      title: "ShadCN UI",
      description: "Beautiful, accessible component library built on Radix UI and Tailwind",
      gradient: "from-emerald-500/20 to-teal-500/20",
      hoverGradient: "from-emerald-500/30 to-teal-500/30",
      glowColor: "shadow-emerald-500/25",
    },
    {
      icon: Database,
      title: "Supabase",
      description: "Open-source Firebase alternative with PostgreSQL, Auth, and real-time features",
      gradient: "from-orange-500/20 to-red-500/20",
      hoverGradient: "from-orange-500/30 to-red-500/30",
      glowColor: "shadow-orange-500/25",
    },
    {
      icon: Brain,
      title: "AI Models",
      description: "Multi-model support: OpenAI, Gemini, Claude, and Groq for diverse AI tasks",
      gradient: "from-indigo-500/20 to-purple-500/20",
      hoverGradient: "from-indigo-500/30 to-purple-500/30",
      glowColor: "shadow-indigo-500/25",
    },
    {
      icon: Rocket,
      title: "Vercel Deployment",
      description: "Lightning-fast global deployment with zero-config serverless infrastructure",
      gradient: "from-rose-500/20 to-pink-500/20",
      hoverGradient: "from-rose-500/30 to-pink-500/30",
      glowColor: "shadow-rose-500/25",
    },
  ]

  const whyChoose = [
    {
      icon: Lock,
      title: "Privacy-First Design",
      description: "User controls their own API keys. We never store or access your credentials with BYOK approach",
      gradient: "from-cyan-500/20 to-blue-500/20",
      hoverGradient: "from-cyan-500/30 to-blue-500/30",
      glowColor: "shadow-cyan-500/25",
    },
    {
      icon: Zap,
      title: "Real-Time Performance",
      description: "Experience instant AI responses with optimized processing and no latency delays",
      gradient: "from-yellow-500/20 to-orange-500/20",
      hoverGradient: "from-yellow-500/30 to-orange-500/30",
      glowColor: "shadow-yellow-500/25",
    },
    {
      icon: Layers,
      title: "Multi-Model AI Support",
      description: "Choose from OpenAI, Gemini, Claude, or Groq. Switch models seamlessly anytime",
      gradient: "from-purple-500/20 to-indigo-500/20",
      hoverGradient: "from-purple-500/30 to-indigo-500/30",
      glowColor: "shadow-purple-500/25",
    },
    {
      icon: Sparkles,
      title: "Clean, Intuitive Interface",
      description: "Modern minimal design focused on productivity. No clutter, just pure functionality",
      gradient: "from-emerald-500/20 to-teal-500/20",
      hoverGradient: "from-emerald-500/30 to-teal-500/30",
      glowColor: "shadow-emerald-500/25",
    },
    {
      icon: Shield,
      title: "No Hidden Costs",
      description: "Transparent pricing model. Pay only for what you use with complete cost visibility",
      gradient: "from-green-500/20 to-emerald-500/20",
      hoverGradient: "from-green-500/30 to-emerald-500/30",
      glowColor: "shadow-green-500/25",
    },
    {
      icon: Globe,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted data handling and secure authentication",
      gradient: "from-blue-500/20 to-cyan-500/20",
      hoverGradient: "from-blue-500/30 to-cyan-500/30",
      glowColor: "shadow-blue-500/25",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Mouse-following light */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 left-32 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <div className="absolute top-48 right-40 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-300" />
          <div className="absolute bottom-40 left-2/3 w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping delay-700" />
          <div className="absolute bottom-24 right-24 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-500" />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Zap className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-400/40 transition-all duration-300" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
                NexusAI
              </span>
              <span className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-all duration-300">
                powered by Vionys
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button className="text-sm px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-2 hover:shadow-2xl">
                <Sparkles className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/admin-login">
              <Button className="text-sm px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-2 hover:shadow-2xl">
                <ShieldCheck className="w-4 h-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-12 relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Floating elements */}
          <div className="absolute top-24 left-24 animate-float">
            <Brain className="w-6 h-6 text-emerald-400/60" />
          </div>
          <div className="absolute top-36 right-36 animate-float-delayed">
            <Sparkles className="w-5 h-5 text-teal-400/60" />
          </div>
          <div className="absolute bottom-24 left-1/4 animate-float">
            <Rocket className="w-6 h-6 text-cyan-400/60" />
          </div>

          {/* Main title with gradient */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent leading-tight animate-fade-in-up">
              Learn More About
            </h1>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent leading-tight animate-fade-in-up delay-200">
              Our AI Software
            </h2>
          </div>

          {/* Subtitle with enhanced styling */}
          <div className="max-w-4xl mx-auto">
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed animate-fade-in-up delay-400">
              Discover how Vionys bridges obstacles in AI technology. Learn about the cutting-edge technologies that power
              NexusAI and why it's the perfect solution for seamless, secure AI integration.
            </p>
          </div>

          {/* Enhanced CTA */}
          <div className="animate-fade-in-up delay-600">
            <Link href="/login">
              <Button className="group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white rounded-2xl text-lg px-10 py-5 hover:scale-105 transition-all duration-300 shadow-2xl shadow-emerald-500/50 hover:shadow-cyan-500/50 font-semibold">
                <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Get Started Today
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-emerald-400/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-emerald-400 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="text-center relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
            </div>
            <h2 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Technologies Used
            </h2>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Built with cutting-edge modern tools and frameworks
            </p>
          </div>

          {/* Technologies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {technologies.map((tech, idx) => {
              const Icon = tech.icon
              return (
                <Card
                  key={idx}
                  className={`group relative backdrop-blur-xl bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-500 hover:border-emerald-400/50 hover:scale-105 hover:-translate-y-2 shadow-2xl ${tech.glowColor} hover:shadow-2xl rounded-3xl overflow-hidden animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Floating particles on hover */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-ping transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-current rounded-full opacity-0 group-hover:opacity-40 group-hover:animate-ping transition-opacity duration-500 delay-300" />

                  <div className="relative z-10">
                    {/* Icon with enhanced styling */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-lg ${tech.glowColor}`}>
                      <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Title with gradient */}
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-300">
                      {tech.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                      {tech.description}
                    </p>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-emerald-500/5 group-hover:via-teal-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="text-center relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-full blur-3xl" />
            </div>
            <h2 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Why Choose This Software?
            </h2>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Features designed for modern AI-powered productivity
            </p>
          </div>

          {/* Why Choose Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChoose.map((item, idx) => {
              const Icon = item.icon
              return (
                <Card
                  key={idx}
                  className={`group relative backdrop-blur-xl bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-500 hover:border-purple-400/50 hover:scale-105 hover:-translate-y-2 shadow-2xl ${item.glowColor} hover:shadow-2xl rounded-3xl overflow-hidden animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 150 + 300}ms` }}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Floating particles on hover */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-ping transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-current rounded-full opacity-0 group-hover:opacity-40 group-hover:animate-ping transition-opacity duration-500 delay-300" />

                  <div className="relative z-10">
                    {/* Icon with enhanced styling */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-lg ${item.glowColor}`}>
                      <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Title with gradient */}
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-indigo-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
          </div>

          <Card className="relative backdrop-blur-2xl bg-white/5 border-white/20 p-12 sm:p-16 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 rounded-3xl overflow-hidden group">
            {/* Animated border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            <div className="relative z-10 text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl mb-6 shadow-lg shadow-emerald-500/25">
                <Rocket className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Ready to use NexusAI?
              </h2>

              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Join thousands of users leveraging AI for intelligent automation and real-time assistance.
                Experience the future of AI-powered productivity today.
              </p>

              <Link href="/login">
                <Button className="group bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white rounded-2xl text-lg px-10 py-6 hover:scale-105 transition-all duration-300 shadow-2xl shadow-emerald-500/50 hover:shadow-cyan-500/50 font-semibold">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Explore Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-32 border-t border-white/20 bg-gradient-to-t from-slate-950 to-slate-900/50 backdrop-blur-xl">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
                Contact Information
              </h3>
              <p className="text-slate-400 text-lg mb-2">
                <span className="font-semibold">Email:</span> support@nexusai.com
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                Have questions? We're here to help and answer any questions you might have about our AI-powered platform.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link href="/" className="block text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-lg">
                  Home
                </Link>
                <Link href="/login" className="block text-slate-400 hover:text-cyan-400 transition-colors duration-300 text-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced copyright */}
          <div className="text-center relative pt-8">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-2xl" />
            </div>
            <p className="text-slate-400 text-lg font-medium relative z-10">
              © 2025{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                NexusAI
              </span>
              . All rights reserved.
            </p>
            <p className="text-slate-500 text-base mt-3">
              Bridging obstacles in AI technology - Powered by Vionys
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
