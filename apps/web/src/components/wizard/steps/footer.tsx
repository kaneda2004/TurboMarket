import { useState } from "react";
import { Mail, MapPin, Shield, Plus, Trash2, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

interface FooterStepProps {
  data: {
    unsubscribeLink: boolean;
    companyAddress: string;
    socialLinks: Array<{ platform: string; url: string }>;
  };
  onUpdate: (data: any) => void;
  wizardData: any;
}

const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "blue" },
  { id: "twitter", label: "Twitter", icon: Twitter, color: "sky" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "pink" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "blue" },
];

export function FooterStep({ data, onUpdate, wizardData }: FooterStepProps) {
  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const updateField = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const addSocialLink = () => {
    if (newSocialPlatform && newSocialUrl) {
      const newLinks = [
        ...data.socialLinks,
        { platform: newSocialPlatform, url: newSocialUrl }
      ];
      onUpdate({ socialLinks: newLinks });
      setNewSocialPlatform("");
      setNewSocialUrl("");
    }
  };

  const removeSocialLink = (index: number) => {
    const newLinks = data.socialLinks.filter((_, i) => i !== index);
    onUpdate({ socialLinks: newLinks });
  };

  const getComplianceScore = () => {
    let score = 0;
    if (data.unsubscribeLink) score += 40;
    if (data.companyAddress.trim()) score += 30;
    if (data.socialLinks.length > 0) score += 30;
    return score;
  };

  const getSocialIcon = (platform: string) => {
    const socialPlatform = SOCIAL_PLATFORMS.find(p => p.id === platform);
    return socialPlatform ? socialPlatform.icon : Mail;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complete your footer
        </h1>
        <p className="text-lg text-gray-600">
          Add required compliance elements and social links to finalize your email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Footer Configuration */}
        <div className="lg:col-span-2 space-y-8">
          {/* Compliance Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-yellow-900">Legal Compliance</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={data.unsubscribeLink}
                  onChange={(e) => updateField("unsubscribeLink", e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-yellow-900">Include unsubscribe link</div>
                  <div className="text-sm text-yellow-700">
                    Required by CAN-SPAM Act and GDPR
                  </div>
                </div>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-yellow-900 mb-2">
                  Company Physical Address
                </label>
                <textarea
                  value={data.companyAddress}
                  onChange={(e) => updateField("companyAddress", e.target.value)}
                  placeholder="123 Business St, Suite 100&#10;City, State 12345&#10;United States"
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                  rows={3}
                />
                <div className="mt-1 text-xs text-yellow-700">
                  Physical address is required by law for commercial emails
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h2>
            
            {/* Existing Social Links */}
            <div className="space-y-3 mb-4">
              {data.socialLinks.map((link, index) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">{link.platform}</div>
                      <div className="text-sm text-gray-600 truncate">{link.url}</div>
                    </div>
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add New Social Link */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select platform</option>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                
                <input
                  type="url"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="https://social-platform.com/yourpage"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <button
                  onClick={addSocialLink}
                  disabled={!newSocialPlatform || !newSocialUrl}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Compliance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Footer Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Footer Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              {/* Social Links */}
              {data.socialLinks.length > 0 && (
                <div className="flex justify-center space-x-4 mb-4">
                  {data.socialLinks.map((link, index) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <div key={index} className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Company Address */}
              {data.companyAddress && (
                <div className="text-center text-gray-600 mb-3 whitespace-pre-line">
                  {data.companyAddress}
                </div>
              )}
              
              {/* Unsubscribe Link */}
              {data.unsubscribeLink && (
                <div className="text-center">
                  <a href="#" className="text-blue-600 underline text-xs">
                    Unsubscribe from these emails
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Checker */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Compliance Score</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-green-700 mb-2">
                <span>Compliance</span>
                <span>{getComplianceScore()}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getComplianceScore() === 100 ? "bg-green-500" : 
                    getComplianceScore() >= 70 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${getComplianceScore()}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${data.unsubscribeLink ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className={data.unsubscribeLink ? "text-green-800" : "text-red-800"}>
                  Unsubscribe link
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${data.companyAddress.trim() ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className={data.companyAddress.trim() ? "text-green-800" : "text-red-800"}>
                  Physical address
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${data.socialLinks.length > 0 ? "bg-green-500" : "bg-yellow-500"}`}></div>
                <span className={data.socialLinks.length > 0 ? "text-green-800" : "text-yellow-800"}>
                  Social presence (optional)
                </span>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Legal Requirements</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div>• CAN-SPAM Act (US): Requires unsubscribe link and physical address</div>
              <div>• GDPR (EU): Requires clear unsubscribe option</div>
              <div>• CASL (Canada): Requires identification and unsubscribe mechanism</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}