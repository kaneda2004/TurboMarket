import { useState } from "react";
import { Volume2, Users, Briefcase, Heart } from "lucide-react";

interface VoiceStepProps {
  data: {
    professional: number; // 0-100 scale
    friendly: number; // 0-100 scale
    tone: string;
  };
  onUpdate: (data: any) => void;
  wizardData: any;
}

const TONE_PRESETS = [
  {
    id: "professional",
    label: "Professional",
    icon: Briefcase,
    description: "Formal, authoritative, business-focused",
    professional: 90,
    friendly: 30,
    color: "blue",
  },
  {
    id: "friendly",
    label: "Friendly",
    icon: Heart,
    description: "Warm, approachable, conversational",
    professional: 30,
    friendly: 90,
    color: "green",
  },
  {
    id: "casual",
    label: "Casual",
    icon: Users,
    description: "Relaxed, informal, personal",
    professional: 20,
    friendly: 70,
    color: "purple",
  },
  {
    id: "authoritative",
    label: "Authoritative",
    icon: Volume2,
    description: "Confident, expert, trustworthy",
    professional: 80,
    friendly: 40,
    color: "orange",
  },
];

export function VoiceStep({ data, onUpdate, wizardData }: VoiceStepProps) {
  const [previewText, setPreviewText] = useState("");

  const updateSlider = (field: string, value: number) => {
    onUpdate({ [field]: value });
    generatePreview({ ...data, [field]: value });
  };

  const applyPreset = (preset: any) => {
    onUpdate({
      professional: preset.professional,
      friendly: preset.friendly,
      tone: preset.id,
    });
    generatePreview({
      professional: preset.professional,
      friendly: preset.friendly,
      tone: preset.id,
    });
  };

  const generatePreview = (voiceData: any) => {
    // Simulate AI-generated preview based on voice settings
    const examples = {
      high_professional_low_friendly: "We are pleased to inform you of our latest product enhancement. This update delivers significant value to your organization.",
      low_professional_high_friendly: "Hey there! We've got something amazing to share with you - you're going to absolutely love this new feature!",
      balanced: "Hi! We're excited to show you what we've been working on. This new feature will make your life easier.",
      high_professional_high_friendly: "We're thrilled to share this exciting update with you! Our team has developed a feature that will enhance your experience.",
    };

    let selectedExample = examples.balanced;
    
    if (voiceData.professional > 70 && voiceData.friendly < 40) {
      selectedExample = examples.high_professional_low_friendly;
    } else if (voiceData.professional < 40 && voiceData.friendly > 70) {
      selectedExample = examples.low_professional_high_friendly;
    } else if (voiceData.professional > 60 && voiceData.friendly > 60) {
      selectedExample = examples.high_professional_high_friendly;
    }

    setPreviewText(selectedExample);
  };

  const getToneDescription = () => {
    const { professional, friendly } = data;
    
    if (professional > 70 && friendly < 40) {
      return "Formal and business-focused";
    } else if (professional < 40 && friendly > 70) {
      return "Warm and conversational";
    } else if (professional > 60 && friendly > 60) {
      return "Professional yet approachable";
    } else if (professional < 40 && friendly < 40) {
      return "Direct and minimal";
    } else {
      return "Balanced and versatile";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Define your voice
        </h1>
        <p className="text-lg text-gray-600">
          Set the tone and personality for your email content. This directly influences Claude's writing style.
        </p>
      </div>

      {/* Tone Presets */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Presets</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TONE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = data.tone === preset.id;
            
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  isSelected
                    ? `border-${preset.color}-500 bg-${preset.color}-50`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon
                  className={`w-6 h-6 mx-auto mb-2 ${
                    isSelected ? `text-${preset.color}-600` : "text-gray-600"
                  }`}
                />
                <h3 className="font-medium text-gray-900 mb-1">{preset.label}</h3>
                <p className="text-xs text-gray-600">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Sliders */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Professional ↔ Casual
          </label>
          <div className="px-3">
            <input
              type="range"
              min="0"
              max="100"
              value={data.professional}
              onChange={(e) => updateSlider("professional", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Casual</span>
              <span>{data.professional}%</span>
              <span>Professional</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Authoritative ↔ Friendly
          </label>
          <div className="px-3">
            <input
              type="range"
              min="0"
              max="100"
              value={data.friendly}
              onChange={(e) => updateSlider("friendly", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Authoritative</span>
              <span>{data.friendly}%</span>
              <span>Friendly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Description */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2">Current Voice Profile</h3>
        <p className="text-gray-700 mb-3">{getToneDescription()}</p>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Professional: {data.professional}%</span>
          {" • "}
          <span className="font-medium">Friendly: {data.friendly}%</span>
        </div>
      </div>

      {/* AI Preview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Preview</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-2">Sample email content with your voice settings:</div>
          <p className="text-gray-800 leading-relaxed">
            {previewText || "Adjust the voice settings to see a preview of your email tone."}
          </p>
        </div>
        <button
          onClick={() => generatePreview(data)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800"
        >
          Generate new preview →
        </button>
      </div>

      {/* Brand Voice Integration */}
      {wizardData.purpose.emailType && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="font-semibold text-indigo-900 mb-2">
            🎨 Brand Voice Integration
          </h3>
          <p className="text-indigo-800 mb-3">
            Your voice settings will be automatically applied to all Claude-generated content, 
            ensuring consistent brand personality across your campaign.
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-indigo-700">Subject lines</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-indigo-700">Body content</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-indigo-700">Call-to-action text</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}