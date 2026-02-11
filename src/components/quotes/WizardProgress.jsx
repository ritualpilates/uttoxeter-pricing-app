import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 'start', label: 'Details' },
  { id: 'departments', label: 'Departments' },
  { id: 'garments', label: 'Garments' },
  { id: 'hygiene', label: 'Hygiene' },
  { id: 'review', label: 'Review' }
];

export default function WizardProgress({ currentStep }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-white border-b border-[#E0E0E0] py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isComplete ? 'bg-green-600 text-white' :
                    isActive ? 'bg-[#203050] text-white' :
                    'bg-[#E0E0E0] text-[#5B6472]'
                  }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    isActive ? 'text-[#203050]' : 'text-[#5B6472]'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isComplete ? 'bg-green-600' : 'bg-[#E0E0E0]'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}