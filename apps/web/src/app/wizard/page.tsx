"use client";

import { useState } from "react";
import { WizardLayout } from "@/components/wizard/layout";
import { PurposeStep } from "@/components/wizard/steps/purpose";
import { HookStep } from "@/components/wizard/steps/hook";
import { StructureStep } from "@/components/wizard/steps/structure";
import { VoiceStep } from "@/components/wizard/steps/voice";
import { CTAStep } from "@/components/wizard/steps/cta";
import { FooterStep } from "@/components/wizard/steps/footer";

export interface WizardData {
  purpose: {
    emailType: "launch" | "newsletter" | "survey" | "waitlist" | "";
    audienceType: "new" | "existing" | "";
    goal: "drive_clicks" | "promote_offer" | "build_awareness" | "gather_feedback" | "";
  };
  hook: {
    subjectLine: string;
    previewText: string;
    selectedVariant: number;
  };
  structure: {
    blocks: Array<{
      id: string;
      type: "header" | "text" | "image" | "button" | "divider";
      content: any;
    }>;
    storyArc: {
      problem: boolean;
      proof: boolean;
      cta: boolean;
    };
  };
  voice: {
    professional: number; // 0-100 scale
    friendly: number; // 0-100 scale
    tone: string;
  };
  cta: {
    buttonText: string;
    buttonUrl: string;
    style: "primary" | "secondary" | "outline";
    clickCostEstimate: number;
  };
  footer: {
    unsubscribeLink: boolean;
    companyAddress: string;
    socialLinks: Array<{ platform: string; url: string }>;
  };
}

const STEPS = [
  { id: "purpose", title: "Purpose", component: PurposeStep },
  { id: "hook", title: "Hook", component: HookStep },
  { id: "structure", title: "Structure", component: StructureStep },
  { id: "voice", title: "Voice", component: VoiceStep },
  { id: "cta", title: "CTA", component: CTAStep },
  { id: "footer", title: "Footer", component: FooterStep },
];

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    purpose: {
      emailType: "",
      audienceType: "",
      goal: "",
    },
    hook: {
      subjectLine: "",
      previewText: "",
      selectedVariant: 0,
    },
    structure: {
      blocks: [],
      storyArc: {
        problem: false,
        proof: false,
        cta: false,
      },
    },
    voice: {
      professional: 50,
      friendly: 50,
      tone: "",
    },
    cta: {
      buttonText: "",
      buttonUrl: "",
      style: "primary",
      clickCostEstimate: 0,
    },
    footer: {
      unsubscribeLink: true,
      companyAddress: "",
      socialLinks: [],
    },
  });

  const updateWizardData = (step: keyof WizardData, data: any) => {
    setWizardData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <WizardLayout
      steps={STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
    >
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <CurrentStepComponent
            data={wizardData[STEPS[currentStep].id as keyof WizardData] as any}
            onUpdate={(data: any) => updateWizardData(STEPS[currentStep].id as keyof WizardData, data)}
            wizardData={wizardData}
          />
        </div>
        
        <div className="border-t bg-white p-6">
          <div className="flex justify-between max-w-4xl mx-auto">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Save draft logic
                  console.log("Saving draft...", wizardData);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Save Draft
              </button>
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={goToNextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={() => {
                    // Final submission logic
                    console.log("Submitting campaign...", wizardData);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Launch Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}