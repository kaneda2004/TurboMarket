import { useState } from "react";
import { MousePointer, DollarSign, TrendingUp, Settings } from "lucide-react";

interface CTAStepProps {
  data: {
    buttonText: string;
    buttonUrl: string;
    style: "primary" | "secondary" | "outline";
    clickCostEstimate: number;
  };
  onUpdate: (data: any) => void;
  wizardData: any;
}

const BUTTON_STYLES = [
  {
    id: "primary",
    label: "Primary",
    description: "Bold, high-contrast button",
    preview: "bg-blue-600 text-white border-blue-600",
    ctr: "+15%",
  },
  {
    id: "secondary",
    label: "Secondary",
    description: "Subtle, less prominent",
    preview: "bg-gray-600 text-white border-gray-600",
    ctr: "baseline",
  },
  {
    id: "outline",
    label: "Outline",
    description: "Bordered, minimal style",
    preview: "bg-white text-blue-600 border-blue-600",
    ctr: "-5%",
  },
];

const CTA_SUGGESTIONS = [
  "Get Started Now",
  "Learn More",
  "Download Free",
  "Start Your Trial",
  "Shop Now",
  "Sign Up Today",
  "Book a Demo",
  "Claim Your Spot",
  "Join Now",
  "Try It Free",
];

export function CTAStep({ data, onUpdate, wizardData }: CTAStepProps) {
  const [isEstimating, setIsEstimating] = useState(false);

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
    
    if (field === "buttonText" || field === "style") {
      estimateClickCost();
    }
  };

  const estimateClickCost = () => {
    setIsEstimating(true);
    
    // Simulate cost estimation
    setTimeout(() => {
      const baseCost = 0.15; // Base cost per click
      const styleMod = data.style === "primary" ? 1.2 : data.style === "outline" ? 0.9 : 1.0;
      const textMod = data.buttonText.toLowerCase().includes("free") ? 1.3 : 1.0;
      
      const estimatedCost = baseCost * styleMod * textMod;
      onUpdate({ clickCostEstimate: Math.round(estimatedCost * 100) / 100 });
      setIsEstimating(false);
    }, 1500);
  };

  const applySuggestion = (suggestion: string) => {
    updateField("buttonText", suggestion);
  };

  const getClickEstimate = () => {
    const { purpose, hook } = wizardData;
    const baseClicks = 100; // Base expected clicks
    
    let multiplier = 1.0;
    
    // Adjust based on email type
    if (purpose.emailType === "launch") multiplier *= 1.3;
    if (purpose.emailType === "newsletter") multiplier *= 0.8;
    
    // Adjust based on button style
    if (data.style === "primary") multiplier *= 1.15;
    if (data.style === "outline") multiplier *= 0.95;
    
    // Adjust based on button text
    if (data.buttonText.toLowerCase().includes("free")) multiplier *= 1.2;
    if (data.buttonText.toLowerCase().includes("now")) multiplier *= 1.1;
    
    return Math.round(baseClicks * multiplier);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Design your call-to-action
        </h1>
        <p className="text-lg text-gray-600">
          Create compelling buttons that drive clicks and conversions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CTA Configuration */}
        <div className="lg:col-span-2 space-y-8">
          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Button Text
            </label>
            <input
              type="text"
              value={data.buttonText}
              onChange={(e) => updateField("buttonText", e.target.value)}
              placeholder="Enter your call-to-action text..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-2 text-xs text-gray-500">
              {data.buttonText.length}/25 characters (optimal: 2-5 words)
            </div>
          </div>

          {/* Button URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Destination URL
            </label>
            <input
              type="url"
              value={data.buttonUrl}
              onChange={(e) => updateField("buttonUrl", e.target.value)}
              placeholder="https://your-landing-page.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Button Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Button Style
            </label>
            <div className="grid grid-cols-3 gap-4">
              {BUTTON_STYLES.map((style) => {
                const isSelected = data.style === style.id;
                
                return (
                  <button
                    key={style.id}
                    onClick={() => updateField("style", style.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-full py-2 px-4 rounded border-2 ${style.preview} text-center text-sm font-medium mb-3`}>
                      {data.buttonText || "Preview"}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{style.label}</h3>
                    <p className="text-xs text-gray-600 mb-1">{style.description}</p>
                    <div className="text-xs text-green-600">CTR: {style.ctr}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Popular CTAs
            </label>
            <div className="flex flex-wrap gap-2">
              {CTA_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => applySuggestion(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Analytics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Your Email</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {wizardData.hook.subjectLine || "Your compelling email content goes here..."}
                </p>
                <button
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    data.style === "primary"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : data.style === "secondary"
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {data.buttonText || "Your CTA"}
                </button>
              </div>
            </div>
          </div>

          {/* Click Cost Estimator */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Cost Estimator</h3>
            </div>
            
            {isEstimating ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-green-700 mt-2">Calculating...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Cost per click</span>
                  <span className="font-medium text-green-900">
                    ${data.clickCostEstimate || 0.15}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Expected clicks</span>
                  <span className="font-medium text-green-900">
                    {getClickEstimate()}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-800">Total budget</span>
                    <span className="font-bold text-green-900">
                      ${((data.clickCostEstimate || 0.15) * getClickEstimate()).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={estimateClickCost}
              disabled={isEstimating}
              className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              Recalculate
            </button>
          </div>

          {/* Performance Insights */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Performance Tips</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  Action words like "Get", "Start", "Join" increase CTR by 12%
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  Contrasting button colors boost clicks by 21%
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                <span className="text-gray-700">
                  Keep text under 5 words for mobile optimization
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}