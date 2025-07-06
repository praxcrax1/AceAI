"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OnboardingCardProps {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export function OnboardingCard({
  title,
  description,
  stepNumber,
  totalSteps,
  onNext,
  onPrevious,
  onClose,
}: OnboardingCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Step {stepNumber} of {totalSteps}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={stepNumber === 1}
        >
          Previous
        </Button>
        <Button onClick={onNext}>
          {stepNumber === totalSteps ? "Finish" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}

const onboardingSteps = [
  {
    title: "Welcome to AceAI",
    description:
      "AceAI helps you chat with your documents using artificial intelligence. Follow this quick guide to get started.",
  },
  {
    title: "Upload Documents",
    description:
      "Start by uploading PDF documents that you want to chat with. You can upload files from the Documents page.",
  },
  {
    title: "Chat With Your Documents",
    description:
      "Once uploaded, you can select a document and ask questions about its content. AceAI will provide answers based on the document.",
  },
  {
    title: "View Analytics",
    description:
      "Track your document usage, chat sessions, and other metrics in the Analytics dashboard.",
  },
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      // In a real app, you would save this preference to localStorage or user settings
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // In a real app, you would save this preference to localStorage or user settings
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep - 1];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <OnboardingCard
        title={step.title}
        description={step.description}
        stepNumber={currentStep}
        totalSteps={onboardingSteps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onClose={handleClose}
      />
    </div>
  );
}
