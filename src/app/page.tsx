"use client";
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Info, AlertTriangle, Link as LinkIcon, Copy, CheckCircle, Eye, AlertOctagon, MessageSquare } from 'lucide-react';

// Define types
type WarningType = 'none' | 'nsfw' | 'trigger' | 'custom';

interface ShortUrlResponse {
  shortCode: string;
  originalUrl: string;
}

interface ShortUrlPayload {
  originalUrl: string;
  alias?: string;
  warningType?: Exclude<WarningType, 'none'>;
  customWarning?: string;
}

const Homepage: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [alias, setAlias] = useState<string>('');
  const [warningType, setWarningType] = useState<WarningType>('none');
  const [customWarning, setCustomWarning] = useState<string>('');
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [shortenedUrl, setShortenedUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleWarningChange = (value: WarningType) => {
    setWarningType(value);
    setShowCustom(value === 'custom');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setShortenedUrl('');
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (warningType === 'custom' && !customWarning) {
      setError('Please enter a custom warning message');
      return;
    }

    setLoading(true);

    try {
      // Create the payload
      const payload: ShortUrlPayload = {
        originalUrl: url,
      };

      // Only add optional fields if they have values
      if (alias) payload.alias = alias;
      if (warningType !== 'none') payload.warningType = warningType as Exclude<WarningType, 'none'>;
      if (warningType === 'custom') payload.customWarning = customWarning;

      // Send the request
      const response = await fetch('/api/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error('Failed to create short URL: ' + body.error);
      }

      const data: ShortUrlResponse = await response.json();
      const domain = window.location.hostname;
      const protocol = window.location.protocol;
      setShortenedUrl(`${protocol}//${domain === 'localhost' ? 'kyp.sh' : domain}/${data.shortCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = (): void => {
    setUrl('');
    setAlias('');
    setWarningType('none');
    setCustomWarning('');
    setShowCustom(false);
    setShortenedUrl('');
    setError('');
  };

  // Radio option component
  const WarningOption: React.FC<{
    value: WarningType;
    icon: React.ReactNode;
    label: string;
    description: string;
  }> = ({ value, icon, label, description }) => (
    <div 
      className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
        warningType === value 
          ? 'border-blue-500 bg-blue-900/20' 
          : 'border-gray-700 bg-gray-800 hover:border-blue-400/50'
      }`}
      onClick={() => handleWarningChange(value)}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center">
          <div className={`mr-3 flex h-5 items-center ${warningType === value ? 'text-blue-400' : 'text-gray-400'}`}>
            {icon}
          </div>
          <div className="text-sm">
            <label 
              className={`font-medium cursor-pointer ${warningType === value ? 'text-blue-300' : 'text-gray-300'}`}
            >
              {label}
            </label>
            <p className="text-gray-500 mt-1 text-xs">{description}</p>
          </div>
        </div>
      </div>
      <div className="ml-3 flex h-5 items-center">
        <input
          type="radio"
          name="warning-type"
          value={value}
          checked={warningType === value}
          onChange={() => handleWarningChange(value)}
          className="h-4 w-4 border-gray-600 text-blue-500 focus:ring-blue-600"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
            kypsh
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            URL shortener with built-in content warnings
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          {!shortenedUrl ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Input */}
              <div>
                <label htmlFor="url" className="block text-gray-300 mb-2 font-semibold">
                  URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="pl-10 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    required
                  />
                </div>
              </div>

              {/* Alias Input (Optional) */}
              <div>
                <label htmlFor="alias" className="block text-gray-300 mb-2 font-semibold">
                  Custom Alias (optional)
                </label>
                <input
                  type="text"
                  id="alias"
                  value={alias}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAlias(e.target.value)}
                  placeholder="my-custom-link"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>

              {/* Warning Type Radio Buttons */}
              <div>
                <label className="block text-gray-300 mb-3 font-semibold">
                  Warning Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <WarningOption 
                    value="none" 
                    icon={<Info className="h-5 w-5" />} 
                    label="No warning" 
                    description="Direct access to the link with no warning screen"
                  />
                  <WarningOption 
                    value="nsfw" 
                    icon={<Eye className="h-5 w-5" />} 
                    label="NSFW Content" 
                    description="Not suitable for work or public viewing"
                  />
                  <WarningOption 
                    value="trigger" 
                    icon={<AlertOctagon className="h-5 w-5" />} 
                    label="Potentially Triggering" 
                    description="Content that may be distressing to some users"
                  />
                  <WarningOption 
                    value="custom" 
                    icon={<MessageSquare className="h-5 w-5" />} 
                    label="Custom Warning" 
                    description="Create your own warning message"
                  />
                </div>
              </div>

              {/* Custom Warning Input */}
              {showCustom && (
                <div className="animate-fadeIn">
                  <label htmlFor="customWarning" className="block text-gray-300 mb-2 font-medium">
                    Custom warning message
                  </label>
                  <textarea
                    id="customWarning"
                    value={customWarning}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCustomWarning(e.target.value)}
                    placeholder="Enter your custom warning message"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    rows={3}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
              >
                {loading ? 'Creating...' : 'Create Short URL'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-200">URL Shortened!</h2>
              </div>

              <div className="p-4 bg-gray-800 rounded-md flex items-center justify-between">
                <div className="truncate mr-2 text-lg font-medium text-blue-300">
                  {shortenedUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 p-2 text-gray-300 hover:text-white focus:outline-none"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={resetForm}
                  className="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="bg-blue-900/50 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">Content Warnings</h3>
            </div>
            <p className="text-gray-400">Add NSFW, trigger, or custom warnings to let people know what to expect before visiting a link.</p>
          </div>
          
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="bg-blue-900/50 p-3 rounded-full">
                <LinkIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">Custom Aliases</h3>
            </div>
            <p className="text-gray-400">Create memorable short links with custom aliases instead of random characters.</p>
          </div>
          
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center mb-4">
              <div className="bg-blue-900/50 p-3 rounded-full">
                <Info className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">Simple & Fast</h3>
            </div>
            <p className="text-gray-400">Generate short URLs quickly with our clean and intuitive interface. No account required.</p>
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
};

export default Homepage;