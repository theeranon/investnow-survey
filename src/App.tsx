/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { SurveyForm } from './components/SurveyForm';
import { SubmissionSuccess } from './components/SubmissionSuccess';
import { AdminSettings } from './components/AdminSettings';
import { SurveyResponse } from './types/survey';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebaseAuth';
import { appendSurveyRow } from './services/googleSheets';
import { Shield, Lock } from 'lucide-react';

const STORAGE_KEY_RESPONSES = 'executive_survey_responses_v3';
const STORAGE_KEY_SHEET_ID = 'executive_survey_sheet_id_v3';
const STORAGE_KEY_SHEET_URL = 'executive_survey_sheet_url_v3';

export default function App() {
  const [currentView, setCurrentView] = useState<'form' | 'success' | 'settings'>('form');

  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESPONSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Google OAuth & Sheets State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_SHEET_ID) || null;
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_SHEET_URL) || null;
  });

  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save responses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESPONSES, JSON.stringify(responses));
    } catch (e) {
      console.error(e);
    }
  }, [responses]);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err) {
      console.error('Google Sign In failed:', err);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  const handleSetSpreadsheet = (id: string, url: string) => {
    setSpreadsheetId(id);
    setSpreadsheetUrl(url);
    localStorage.setItem(STORAGE_KEY_SHEET_ID, id);
    localStorage.setItem(STORAGE_KEY_SHEET_URL, url);
  };

  const handleFormSubmit = async (newResponse: SurveyResponse) => {
    setIsSubmitting(true);

    // Save to Google Sheet if connected
    const currentToken = accessToken || (await getAccessToken());
    if (currentToken && spreadsheetId) {
      try {
        await appendSurveyRow(currentToken, spreadsheetId, newResponse);
      } catch (err) {
        console.error('Failed to append to Google Sheet:', err);
      }
    }

    setResponses((prev) => [newResponse, ...prev]);
    setIsSubmitting(false);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearResponses = () => {
    if (window.confirm('คุณต้องการลบข้อมูลการตอบกลับทั้งหมดใช่หรือไม่?')) {
      setResponses([]);
    }
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
          <SurveyForm
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {currentView === 'success' && (
          <SubmissionSuccess
            onReset={() => {
              setCurrentView('form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            spreadsheetUrl={spreadsheetUrl}
          />
        )}

        {currentView === 'settings' && (
          <AdminSettings
            onBack={() => setCurrentView('form')}
            user={user}
            accessToken={accessToken}
            spreadsheetId={spreadsheetId}
            spreadsheetUrl={spreadsheetUrl}
            onSetSpreadsheet={handleSetSpreadsheet}
            onConnectGoogle={handleConnectGoogle}
            onDisconnectGoogle={handleDisconnectGoogle}
            isConnectingGoogle={isConnectingGoogle}
            responses={responses}
            onClearResponses={handleClearResponses}
          />
        )}
      </main>

      {/* Discreet Footer with hidden Admin/Settings entry */}
      <footer className="py-8 px-4 text-center text-xs text-[#64748b] relative z-10 border-t border-[#1e293b]/40">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-[#94a3b8] font-light">
            <Shield className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Executive Wealth Masterclass · Confidential & Proprietary</span>
          </span>
          <span className="text-[#334155]">·</span>
          <button
            type="button"
            onClick={() =>
              setCurrentView((prev) => (prev === 'settings' ? 'form' : 'settings'))
            }
            className="text-[#94a3b8] hover:text-[#d4af37] inline-flex items-center gap-1 transition-colors focus:outline-none"
            title="ตั้งค่าและจัดการข้อมูล Google Sheets สำหรับผู้ดูแลระบบ"
          >
            <Lock className="w-3 h-3" />
            <span>
              {currentView === 'settings'
                ? 'กลับสู่แบบฟอร์ม'
                : 'ตั้งค่า Google Sheets (ผู้ดูแล)'}
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
