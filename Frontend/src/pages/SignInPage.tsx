import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Heart } from 'lucide-react';

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Heart className="w-12 h-12 text-teal-600" />
          <h1 className="text-4xl font-bold text-gray-800">
            Way<span className="text-teal-600">Point</span>
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Your Campus Mental Health Companion</p>
      </div>
      
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-2xl"
          }
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/onboarding"
      />
    </div>
  );
};

export default SignInPage;
