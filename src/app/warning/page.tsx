"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertTriangle, Link as LinkIcon, ArrowLeft } from 'lucide-react';

export default function WarningPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
 
  //const shortCode = searchParams.get('shortCode');
  const destination = searchParams.get('destination');
  const warningType = searchParams.get('warningType');
  const customWarning = searchParams.get('customWarning');
 
  useEffect(() => {
    if (!destination) {
      router.push('/');
      return;
    }
   
    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(destination);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
   
    return () => clearInterval(timer);
  }, [destination, router]);
 
  // Generate warning message based on type
  let warningMessage = '';
  const warningIcon = <AlertTriangle className="h-8 w-8 text-red-500" />;
  
  if (customWarning) {
    warningMessage = customWarning;
  } else if (warningType) {
    switch (warningType) {
      case 'trigger':
        warningMessage = 'This link may contain sensitive content that could be distressing to some users.';
        break;
      case 'nsfw':
        warningMessage = 'This link may contain explicit or adult content that is not suitable for work or public viewing.';
        break;
      default:
        warningMessage = 'Please use caution when proceeding to this link.';
    }
  }
 
  function handleProceed() {
    if (destination) {
      router.push(destination);
    }
  }
 
  function handleGoBack() {
    router.back();
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <a href="https://kyp.sh"><h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
            kypsh
          </h1></a>
          <p className="mt-4 text-xl text-gray-300">
            URL shortener with built-in content warnings
          </p>
        </div>

        {/* Main Warning Content */}
        <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-4">
                {warningIcon}
              </div>
              <h2 className="text-2xl font-bold text-gray-200">Content Warning</h2>
            </div>

            <div className="p-5 bg-gray-800/50 border border-gray-700 rounded-md">
              <p className="text-lg text-center mb-6">{warningMessage}</p>
            
              <div className="text-sm text-gray-400 mb-4">
                You are about to be redirected to:
                <div className="mt-2 p-3 bg-gray-800 rounded-md flex items-center">
                  <LinkIcon className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                  <div className="truncate font-medium text-blue-300">{destination}</div>
                </div>
              </div>
              
              <p className="text-center text-gray-400 mb-4">
                Auto-redirect in <span className="text-blue-400 font-bold">{countdown}</span> seconds
              </p>
            
              <div className="flex justify-between">
                <button
                  onClick={handleGoBack}
                  className="flex items-center py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </button>
              
                <button
                  onClick={handleProceed}
                  className="py-2 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors"
                >
                  Proceed ({countdown})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-300 text-sm">
          <p>© {new Date().getFullYear()} kypsh | Keep Your People Safe</p>
          <p>Created by <a href="https://www.blake.to" target="_blank" className="text-yellow-300">Blake Stevenson</a></p>
        </footer>
      </div>
    </div>
  );
}