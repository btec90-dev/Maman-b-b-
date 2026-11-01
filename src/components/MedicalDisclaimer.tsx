import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert, HeartPulse, PhoneCall } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<Props> = ({ compact = false }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <>
      <div className={`w-full bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-xl ${compact ? 'p-2.5' : 'p-3'} text-rose-900 dark:text-rose-200 flex items-start gap-2.5 text-xs transition-colors`}>
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium leading-relaxed">
            <span className="font-semibold text-rose-700 dark:text-rose-300">Medical Notice:</span> For informational purposes only; not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
        <button
          onClick={() => setShowDetailModal(true)}
          className="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 underline shrink-0 whitespace-nowrap cursor-pointer transition-colors"
        >
          Safety Guidelines
        </button>
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">
                  Maternal Health &amp; Safety Notice
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              <p>
                <strong>Maman &amp; bébé</strong> is designed as a supportive daily tracking utility for expectant parents. It does not provide clinical diagnoses, monitor real-time medical emergencies, or replace direct care from your OB-GYN, certified nurse midwife, or maternal-fetal medicine specialist.
              </p>

              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60">
                <div className="flex items-center gap-2 font-semibold text-rose-800 dark:text-rose-300 mb-2">
                  <HeartPulse className="w-4 h-4" />
                  <span>When to Seek Immediate Emergency Care:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-rose-900 dark:text-rose-200 pl-1">
                  <li>Marked decrease or absence of fetal movement after 28 weeks.</li>
                  <li>Bright red vaginal bleeding (more than light spotting).</li>
                  <li>Sudden severe swelling in face, hands, or around eyes accompanied by severe headache (signs of preeclampsia).</li>
                  <li>Continuous fluid leaking (rupture of membranes / water breaking).</li>
                  <li>Severe abdominal pain or continuous uterine cramping that does not relax.</li>
                  <li>High fever (above 100.4°F / 38°C) or severe chills.</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                <PhoneCall className="w-4 h-4 text-stone-500" />
                <span>Always keep your doctor&apos;s 24-hour triage line and local labor &amp; delivery unit contact in your phone favorites.</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
