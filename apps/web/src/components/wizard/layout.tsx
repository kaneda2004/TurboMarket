import { CheckCircle, Circle } from "lucide-react";

interface WizardLayoutProps {
  steps: Array<{ id: string; title: string; component: any }>;
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}

export function WizardLayout({
  steps,
  currentStep,
  onStepChange,
  children,
}: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">TurboMarket</h1>
          <p className="text-sm text-gray-600 mt-1">Email Campaign Wizard</p>
        </div>

        <nav className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = index <= currentStep;

            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepChange(index)}
                disabled={!isClickable}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  isCurrent
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : isCompleted
                    ? "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                    : isClickable
                    ? "hover:bg-gray-50"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle
                      className={`w-5 h-5 ${
                        isCurrent ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">
                    Step {index + 1} of {steps.length}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-3">
            Our AI will guide you through each step to create the perfect marketing email.
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Documentation →
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}