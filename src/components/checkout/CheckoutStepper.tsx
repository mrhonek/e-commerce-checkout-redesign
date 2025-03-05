import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentStep, CheckoutStep } from '../../store/slices/checkoutSlice';

interface Step {
  key: CheckoutStep;
  label: string;
}

interface CheckoutStepperProps {
  className?: string;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const checkout = useAppSelector(state => state.checkout);
  const { currentStep, shippingAddress, paymentMethod } = checkout;
  
  const steps: Step[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
  ];
  
  // Determine if a step is clickable (previous steps are clickable)
  const isStepClickable = (step: Step): boolean => {
    switch (step.key) {
      case 'shipping':
        return true;
      case 'payment':
        return !!shippingAddress;
      case 'review':
        return !!shippingAddress && !!paymentMethod;
      default:
        return false;
    }
  };
  
  // Handle clicking on a step
  const handleStepClick = (step: Step) => {
    if (isStepClickable(step)) {
      dispatch(setCurrentStep(step.key));
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isPrevious = steps.findIndex(s => s.key === currentStep) > index;
          const isClickable = isStepClickable(step);
          
          return (
            <React.Fragment key={step.key}>
              {/* Step circle */}
              <div className="flex flex-col items-center relative">
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm relative z-10
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-indigo-600 text-white' 
                      : isPrevious 
                        ? 'bg-green-500 text-white cursor-pointer'
                        : isClickable 
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {index + 1}
                </button>
                <span className={`
                  mt-2 text-sm font-medium
                  ${isActive ? 'text-indigo-600' : isPrevious ? 'text-green-500' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div 
                    className={`
                      h-full rounded-full
                      ${isPrevious ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}; 