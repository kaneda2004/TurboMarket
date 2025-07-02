import { useState } from "react";
import { Sparkles, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";

interface HookStepProps {
  data: {
    subjectLine: string;
    previewText: string;
    selectedVariant: number;
  };
  onUpdate: (data: any) => void;
  wizardData: any;
}

const SAMPLE_SUBJECT_LINES = [
  "🚀 Your new favorite feature is here",
  "The update you've been waiting for",
  "Something special just dropped...",
  "You're going to love this",
  "Ready for a game-changer?",
];

const SAMPLE_PREVIEW_TEXTS = [
  "Get early access to our latest innovation",
  "See what's new in your dashboard",
  "Discover how this changes everything",
  "Your account has been upgraded",
  "Don't miss out on this opportunity",
];

export function HookStep({ data, onUpdate, wizardData }: HookStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState([
    {
      subjectLine: "🚀 Your new favorite feature is here",
      previewText: "Get early access to our latest innovation",
      score: 85,
    },
    {
      subjectLine: "The update you've been waiting for",
      previewText: "See what's new in your dashboard",
      score: 78,
    },
    {
      subjectLine: "Something special just dropped...",
      previewText: "Discover how this changes everything",
      score: 82,
    },
  ]);

  const generateNewVariants = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const newVariants = [
        {
          subjectLine: SAMPLE_SUBJECT_LINES[Math.floor(Math.random() * SAMPLE_SUBJECT_LINES.length)],
          previewText: SAMPLE_PREVIEW_TEXTS[Math.floor(Math.random() * SAMPLE_PREVIEW_TEXTS.length)],
          score: Math.floor(Math.random() * 20) + 75,
        },
        {
          subjectLine: SAMPLE_SUBJECT_LINES[Math.floor(Math.random() * SAMPLE_SUBJECT_LINES.length)],
          previewText: SAMPLE_PREVIEW_TEXTS[Math.floor(Math.random() * SAMPLE_PREVIEW_TEXTS.length)],
          score: Math.floor(Math.random() * 20) + 75,
        },
        {
          subjectLine: SAMPLE_SUBJECT_LINES[Math.floor(Math.random() * SAMPLE_SUBJECT_LINES.length)],
          previewText: SAMPLE_PREVIEW_TEXTS[Math.floor(Math.random() * SAMPLE_PREVIEW_TEXTS.length)],
          score: Math.floor(Math.random() * 20) + 75,
        },
      ];
      setVariants(newVariants);
      setIsGenerating(false);
    }, 2000);
  };

  const selectVariant = (index: number) => {
    onUpdate({
      subjectLine: variants[index].subjectLine,
      previewText: variants[index].previewText,
      selectedVariant: index,
    });
  };

  const updateCustomFields = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create your hook
        </h1>
        <p className="text-lg text-gray-600">
          Craft compelling subject lines and preview text that get your emails opened.
        </p>
      </div>

      {/* AI-Generated Variants */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">AI-Generated Variants</h2>
          <button
            onClick={generateNewVariants}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGenerating ? "Generating..." : "Generate New"}</span>
          </button>
        </div>

        <div className="grid gap-4">
          {variants.map((variant, index) => {
            const isSelected = data.selectedVariant === index;
            
            return (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => selectVariant(index)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      Subject: {variant.subjectLine}
                    </div>
                    <div className="text-sm text-gray-600">
                      Preview: {variant.previewText}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="text-sm font-medium text-gray-700">
                      Score: {variant.score}%
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-green-500">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Email Preview */}
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Gmail</div>
                  <div className="font-medium text-sm text-gray-900">
                    {variant.subjectLine}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {variant.previewText} - Lorem ipsum dolor sit amet...
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Input */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Or create your own</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={data.subjectLine}
              onChange={(e) => updateCustomFields("subjectLine", e.target.value)}
              placeholder="Enter your subject line..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              {data.subjectLine.length}/50 characters (optimal: 30-50)
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Text
            </label>
            <input
              type="text"
              value={data.previewText}
              onChange={(e) => updateCustomFields("previewText", e.target.value)}
              placeholder="Enter your preview text..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              {data.previewText.length}/90 characters (optimal: 35-90)
            </div>
          </div>
        </div>
      </div>

      {/* Hook Lab Insights */}
      {wizardData.purpose.emailType && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-900 mb-2">
            📊 Hook Lab Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-orange-800">Open Rate Prediction</div>
              <div className="text-orange-700">24.3% (+3.2% above average)</div>
            </div>
            <div>
              <div className="font-medium text-orange-800">Best Day to Send</div>
              <div className="text-orange-700">Tuesday, 10:00 AM</div>
            </div>
            <div>
              <div className="font-medium text-orange-800">Competitor Analysis</div>
              <div className="text-orange-700">Similar subject lines: 12 this week</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}