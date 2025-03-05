import React from 'react';
import { CheckCircle } from 'lucide-react';

interface CheckoutStepsProps {
  currentStep: 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  const steps = [
    { id: 'shipping', name: 'Shipping' },
    { id: 'payment', name: 'Payment' },
    { id: 'review', name: 'Review' },
    { id: 'confirmation', name: 'Confirmation' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const stepIndex = getCurrentStepIndex();

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20 w-full' : ''}`}>
            {/* Step connecting line */}
            {index !== steps.length - 1 && (
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div
                  className={`h-0.5 w-full ${
                    index < stepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
            
            <div className="relative flex items-center justify-center">
              {/* Completed Step (with checkmark) */}
              {index < stepIndex ? (
                <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span className="sr-only">{step.name}</span>
                </span>
              ) : index === stepIndex ? (
                // Current Step
                <span className="h-8 w-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                  <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" />
                  <span className="sr-only">{step.name}</span>
                </span>
              ) : (
                // Upcoming Step
                <span className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                  <span className="sr-only">{step.name}</span>
                </span>
              )}
              
              {/* Step Label */}
              <span
                className={`absolute top-10 text-sm font-medium ${
                  index <= stepIndex ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default CheckoutSteps; 