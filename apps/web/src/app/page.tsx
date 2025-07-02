import React from 'react'
import { Rocket, Mail, Users, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Rocket className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TurboMarket</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Email Marketing
            <span className="text-blue-600"> Made Simple</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Design, send, and optimize high-converting marketing emails with AI assistance. 
            Complete campaign wizard from purpose to footer.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
            Start Creating Campaigns
          </button>
        </div>

        {/* Campaign Wizard Preview */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              6-Step Campaign Wizard
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Step 1: Purpose */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Purpose</h4>
                <p className="text-gray-600 text-sm">Choose your campaign type: launch, newsletter, survey, waitlist update</p>
              </div>

              {/* Step 2: Hook */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Hook</h4>
                <p className="text-gray-600 text-sm">AI-generated subject lines ranked by uplift potential</p>
              </div>

              {/* Step 3: Structure */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Structure</h4>
                <p className="text-gray-600 text-sm">Drag-drop MJML blocks with Story-Arc meter</p>
              </div>

              {/* Step 4: Voice */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Voice</h4>
                <p className="text-gray-600 text-sm">Adjust tone from professional to casual with AI</p>
              </div>

              {/* Step 5: CTA */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">5</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">CTA</h4>
                <p className="text-gray-600 text-sm">Dynamic buttons with click cost estimation</p>
              </div>

              {/* Step 6: Footer */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold">6</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Footer</h4>
                <p className="text-gray-600 text-sm">Compliance-ready unsubscribe and contact info</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Segmentation</h4>
            <p className="text-gray-600">Visual rule builder with real-time audience size preview</p>
          </div>
          
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Live Analytics</h4>
            <p className="text-gray-600">Real-time opens, clicks, and scroll-depth heatmaps</p>
          </div>
          
          <div className="text-center">
            <Rocket className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Optimization</h4>
            <p className="text-gray-600">Continuous conversion forecasting and auto-optimization</p>
          </div>
        </div>
      </main>
    </div>
  )
}