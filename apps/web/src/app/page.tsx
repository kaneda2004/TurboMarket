import Link from "next/link";
import { Rocket, Mail, Zap, TrendingUp, Users, Target } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Mail className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            TurboMarket
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered email marketing that actually converts. Create compelling campaigns 
            with Claude 3.7 Sonnet, get predictive insights, and scale to 500+ req/s.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wizard"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Rocket className="w-5 h-5" />
              <span>Create Your First Campaign</span>
            </Link>
            <button className="inline-flex items-center space-x-2 px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              <span>View Live Demo</span>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI-Powered Content
            </h3>
            <p className="text-gray-600">
              Claude 3.7 Sonnet generates compelling subject lines, body content, and CTAs 
              tailored to your brand voice and audience.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Predictive Analytics
            </h3>
            <p className="text-gray-600">
              Real-time open rate predictions, click cost estimation, and competitor 
              analysis powered by ClickHouse analytics.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Segmentation
            </h3>
            <p className="text-gray-600">
              Visual rule builder for audience targeting with real-time segment size 
              preview and dynamic content personalization.
            </p>
          </div>
        </div>

        {/* 6-Step Wizard Preview */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Six-Step Campaign Wizard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { step: 1, title: "Purpose", icon: Target, color: "blue" },
              { step: 2, title: "Hook", icon: Zap, color: "purple" },
              { step: 3, title: "Structure", icon: Mail, color: "green" },
              { step: 4, title: "Voice", icon: Users, color: "orange" },
              { step: 5, title: "CTA", icon: TrendingUp, color: "red" },
              { step: 6, title: "Footer", icon: Rocket, color: "indigo" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className={`p-4 bg-${item.color}-100 rounded-xl mb-3 mx-auto w-fit`}>
                    <Icon className={`w-6 h-6 text-${item.color}-600`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500">Step {item.step}</div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/wizard"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <span>Start Building Your Campaign</span>
              <Rocket className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Powered by Modern Infrastructure
          </h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="px-3 py-1 bg-gray-100 rounded-full">Next.js 14</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">React 18</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Tailwind CSS</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Claude 3.7 Sonnet</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">AWS Bedrock</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">ClickHouse</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">PostgreSQL</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">Docker</span>
          </div>
        </div>
      </div>
    </div>
  );
}