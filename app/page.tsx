"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, Layers, Lock, Cpu, Globe, ArrowRight, ShieldCheck, Twitter, Github, Linkedin, Youtube, Sparkles, Brain, Rocket, Star } from "lucide-react"
import FeedbackForm from "@/components/feedback-form"
import UnauthorizedToast from "@/components/unauthorized-toast"

// Import the floating particles component dynamically to avoid SSR hydration issues
const FloatingParticles = dynamic(() => Promise.resolve(() => {
  const [particles, setParticles] = useState<Array<{left: string, top: string, delay: string, duration: string}>>([])

  useEffect(() => {
    // Generate random particles only on client side
    const newParticles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 2}s`,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-bounce"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  )
}), { ssr: false })

export default function LandingPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Check if user is logged in (client-side)
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/check-user')
        if (response.ok) {
          const data = await response.json()
          setUserName(data.userName)
        }
      } catch (error) {
        console.error('Failed to check user:', error)
      }
    }
    checkUser()

    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "Multi-model AI Support",
      description: "Seamlessly integrate OpenAI, Gemini, Claude, and Groq models",
      gradient: "from-purple-500/20 to-pink-500/20",
      hoverGradient: "from-purple-500/30 to-pink-500/30",
      glowColor: "shadow-purple-500/25",
    },
    {
      icon: Zap,
      title: "Real-time Reasoning",
      description: "Advanced problem-solving with instant intelligent responses",
      gradient: "from-cyan-500/20 to-blue-500/20",
      hoverGradient: "from-cyan-500/30 to-blue-500/30",
      glowColor: "shadow-cyan-500/25",
    },
    {
      icon: Sparkles,
      title: "Clean & Modern UI",
      description: "Intuitive interface designed for productivity and ease of use",
      gradient: "from-emerald-500/20 to-teal-500/20",
      hoverGradient: "from-emerald-500/30 to-teal-500/30",
      glowColor: "shadow-emerald-500/25",
    },
    {
      icon: Lock,
      title: "User-Controlled Keys",
      description: "Your API keys, your control - privacy-first BYOK approach",
      gradient: "from-orange-500/20 to-red-500/20",
      hoverGradient: "from-orange-500/30 to-red-500/30",
      glowColor: "shadow-orange-500/25",
    },
    {
      icon: Rocket,
      title: "Optimized Processing",
      description: "Lightning-fast responses with our advanced engine optimization",
      gradient: "from-indigo-500/20 to-purple-500/20",
      hoverGradient: "from-indigo-500/30 to-purple-500/30",
      glowColor: "shadow-indigo-500/25",
    },
    {
      icon: Globe,
      title: "Cross-Platform",
      description: "Fully responsive design that works perfectly on any device",
      gradient: "from-rose-500/20 to-pink-500/20",
      hoverGradient: "from-rose-500/30 to-pink-500/30",
      glowColor: "shadow-rose-500/25",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
      <UnauthorizedToast />

      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Mouse-following light */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            opacity: mousePosition.x === 0 && mousePosition.y === 0 ? 0 : 1,
          }}
        />

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-300" />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping delay-700" />
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-500" />
        </div>
      </div>

      {/* Floating particles */}
      <FloatingParticles />

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
        <div className="text-center space-y-8 relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Floating elements */}
          <div className="absolute top-20 left-20 animate-float">
            <Star className="w-6 h-6 text-cyan-400/60" />
          </div>
          <div className="absolute top-32 right-32 animate-float-delayed">
            <Sparkles className="w-4 h-4 text-purple-400/60" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float">
            <Brain className="w-5 h-5 text-emerald-400/60" />
          </div>

          {/* Main Icon with enhanced effects */}
          <div className="flex justify-center relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                <Zap className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* User Greeting with animation */}
          {userName && (
            <div className="text-xl sm:text-2xl text-cyan-400 font-medium animate-fade-in">
              <span className="inline-block animate-bounce">👋</span> Hello, {userName}!
            </div>
          )}

          {/* Title with gradient text */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent leading-tight animate-fade-in-up">
              Autonomous AI
            </h1>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight animate-fade-in-up delay-200">
              SYSTEM
            </h2>
          </div>

          {/* Subtitle with enhanced styling */}
          <div className="max-w-4xl mx-auto">
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed animate-fade-in-up delay-400">
              Bridge the obstacles in AI technology with Vionys. Experience seamless access to multiple AI models,
              enterprise-grade security, and intelligent automation that adapts to your needs.
            </p>
          </div>

          {/* CTA Buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 animate-fade-in-up delay-600">
            <Link href="/login">
              <Button className="group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white rounded-2xl text-lg px-10 py-5 hover:scale-105 transition-all duration-300 shadow-2xl shadow-cyan-500/50 hover:shadow-purple-500/50 font-semibold">
                <Rocket className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Get Started
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button variant="outline" className="group border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 rounded-2xl text-lg px-10 py-5 hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-white/5 shadow-xl hover:shadow-cyan-400/20 font-semibold">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-8 sm:p-12">
          <h2 className="text-4xl font-bold text-white mb-6">About Vionys & NexusAI</h2>
          <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
            <p>
              <strong>Vionys</strong> is dedicated to bridging obstacles in AI technology, making advanced artificial intelligence
              accessible to everyone. Our mission is to eliminate the technical barriers that prevent organizations and
              individuals from leveraging the full potential of AI.
            </p>
            <p>
              <strong>NexusAI</strong>, powered by Vionys, provides a unified platform that connects you to multiple AI models
              through a single, intuitive interface. Experience seamless AI integration with enterprise-grade security and
              privacy-first architecture.
            </p>
            <p>
              We embrace a privacy-first BYOK (Bring Your Own Key) approach, ensuring you maintain complete control over
              your API keys and data. Your privacy and security are paramount in everything we build.
            </p>
            <p>
              Join us in bridging the gap between complex AI technology and practical, everyday applications. Experience
              the future of intelligent automation that's designed to adapt and scale with your needs.
            </p>
          </div>
        </Card>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="text-center relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
            </div>
            <h2 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Powerful Features
            </h2>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Everything you need for autonomous AI assistance
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card
                  key={idx}
                  className={`group relative backdrop-blur-xl bg-white/5 border-white/10 p-8 hover:bg-white/10 transition-all duration-500 hover:border-cyan-400/50 hover:scale-105 hover:-translate-y-2 shadow-2xl ${feature.glowColor} hover:shadow-2xl rounded-3xl overflow-hidden animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Floating particles on hover */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-ping transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-current rounded-full opacity-0 group-hover:opacity-40 group-hover:animate-ping transition-opacity duration-500 delay-300" />

                  <div className="relative z-10">
                    {/* Icon with enhanced styling */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-lg ${feature.glowColor}`}>
                      <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Title with gradient */}
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 group-hover:from-cyan-200 group-hover:to-blue-200 transition-all duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
          </div>

          <Card className="relative backdrop-blur-2xl bg-white/5 border-white/20 p-8 sm:p-12 max-w-2xl mx-auto shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 rounded-3xl overflow-hidden group">
            {/* Animated border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mb-6 shadow-lg shadow-cyan-500/25">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
                  Share Your Feedback
                </h2>
                <p className="text-slate-300 text-lg">
                  Help us improve by sharing your thoughts and suggestions
                </p>
              </div>
              <FeedbackForm />
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-32 border-t border-white/20 bg-gradient-to-t from-slate-950 to-slate-900/50 backdrop-blur-xl">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Follow Us Section */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
              Follow Us On
            </h3>
            <div className="flex justify-center space-x-8">
              {[
                { Icon: Twitter, href: "https://twitter.com/nexusai", label: "Twitter" },
                { Icon: Github, href: "https://github.com/nexusai", label: "GitHub" },
                { Icon: Linkedin, href: "https://linkedin.com/company/nexusai", label: "LinkedIn" },
                { Icon: Youtube, href: "https://youtube.com/@nexusai", label: "YouTube" },
              ].map(({ Icon, href, label }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Copyright with enhanced styling */}
          <div className="text-center relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl" />
            </div>
            <p className="text-slate-400 text-lg font-medium relative z-10">
              © 2025{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                NexusAI
              </span>
              {" "}by Vionys. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Bridging obstacles in AI technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}