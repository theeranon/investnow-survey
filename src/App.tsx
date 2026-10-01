/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { SurveyForm } from './components/SurveyForm';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { SurveyResponse } from './types/survey';
import { submitToNetlifyForms } from './services/netlifyForms';

export default function App() {
  const [currentView, setCurrentView] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Null means the submission was accepted; a string is shown to the respondent.
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (newResponse: SurveyResponse) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitToNetlifyForms(newResponse);
    } catch (err) {
      console.error('Failed to submit survey:', err);
      setSubmitError(
        err instanceof Error ? err.message : 'ส่งคำตอบไม่สำเร็จ'
      );
    }

    setIsSubmitting(false);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8ecf4] flex flex-col font-sans relative selection:bg-[#d4af37]/30 selection:text-[#f3e5ab]">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#0f2142]/40 via-[#0a1833]/20 to-transparent blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#044337]/20 rounded-full blur-[110px]" />
      </div>

      <main className="flex-1 px-4 sm:px-6 pt-8 sm:pt-12 relative z-10">
        {currentView === 'form' && (
          <SurveyForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
        )}

        {currentView === 'success' && (
          <SubmissionSuccess
            onReset={() => {
              setCurrentView('form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            submitError={submitError}
          />
        )}
      </main>
    </div>
  );
}
