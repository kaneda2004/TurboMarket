import { Rocket, Mail, Survey, Users } from "lucide-react";

interface PurposeStepProps {
  data: {
    emailType: "launch" | "newsletter" | "survey" | "waitlist" | "";
    audienceType: "new" | "existing" | "";
    goal: "drive_clicks" | "promote_offer" | "build_awareness" | "gather_feedback" | "";
  };
  onUpdate: (data: any) => void;
  wizardData: any;
}

const EMAIL_TYPES = [
  {
    id: "launch",
    title: "Product Launch",
    description: "Announce a new product or feature",
    icon: Rocket,
    color: "blue",
  },
  {
    id: "newsletter",
    title: "Newsletter",
    description: "Regular updates and content",
    icon: Mail,
    color: "green",
  },
  {
    id: "survey",
    title: "Survey Invite",
    description: "Gather feedback from users",
    icon: Survey,
    color: "purple",
  },
  {
    id: "waitlist",
    title: "Waitlist Update",
    description: "Updates for waiting users",
    icon: Users,
    color: "orange",
  },
];

const AUDIENCE_TYPES = [
  {
    id: "new",
    title: "New Users",
    description: "People who just signed up or showed interest",
  },
  {
    id: "existing",
    title: "Existing Users",
    description: "Current customers or subscribers",
  },
];

const GOALS = [
  {
    id: "drive_clicks",
    title: "Drive Clicks",
    description: "Get users to visit your website or landing page",
  },
  {
    id: "promote_offer",
    title: "Promote an Offer",
    description: "Showcase a discount, deal, or special promotion",
  },
  {
    id: "build_awareness",
    title: "Build Awareness",
    description: "Increase brand recognition and engagement",
  },
  {
    id: "gather_feedback",
    title: "Gather Feedback",
    description: "Collect opinions, reviews, or survey responses",
  },
];

export function PurposeStep({ data, onUpdate }: PurposeStepProps) {
  const updateField = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What type of email are you creating?
        </h1>
        <p className="text-lg text-gray-600">
          Let's start by understanding the purpose of your email campaign.
        </p>
      </div>

      {/* Email Type Selection */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EMAIL_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = data.emailType === type.id;
            
            return (
              <button
                key={type.id}
                onClick={() => updateField("emailType", type.id)}
                className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                  isSelected
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon
                  className={`w-8 h-8 mx-auto mb-3 ${
                    isSelected ? `text-${type.color}-600` : "text-gray-600"
                  }`}
                />
                <h3 className="font-medium text-gray-900 mb-1">{type.title}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audience Type Selection */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Audience Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUDIENCE_TYPES.map((audience) => {
            const isSelected = data.audienceType === audience.id;
            
            return (
              <button
                key={audience.id}
                onClick={() => updateField("audienceType", audience.id)}
                className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-2">{audience.title}</h3>
                <p className="text-sm text-gray-600">{audience.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Selection */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Goal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GOALS.map((goal) => {
            const isSelected = data.goal === goal.id;
            
            return (
              <button
                key={goal.id}
                onClick={() => updateField("goal", goal.id)}
                className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-2">{goal.title}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Insight Panel */}
      {data.emailType && data.audienceType && data.goal && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-2">
            🎯 AI Recommendations
          </h3>
          <p className="text-purple-800">
            Based on your selections, we recommend focusing on{" "}
            <strong>personalized subject lines</strong> and{" "}
            <strong>clear call-to-action buttons</strong> for {data.audienceType} users.
            This combination typically sees a 23% higher open rate.
          </p>
        </div>
      )}
    </div>
  );
}