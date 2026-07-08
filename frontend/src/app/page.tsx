'use client';

import Header from '../components/Header/Header';
import StepIndicator from '../components/StepIndicator/StepIndicator';
import FileUploader from '../components/FileUploader/FileUploader';
import CSVPreview from '../components/CSVPreview/CSVPreview';
import ProgressIndicator from '../components/ProgressIndicator/ProgressIndicator';
import ImportResults from '../components/ImportResults/ImportResults';
import { useAppState } from '../hooks/useAppState';

export default function HomePage() {
  const { state, handleFileSelect, handleConfirmImport, handleReset } = useAppState();
  const { step, file, parsedCSV, importResult, error, isProcessing } = state;

  const isIdle = step === 'IDLE';
  const isFileSelected = step === 'FILE_SELECTED';
  const isPreviewing = step === 'PREVIEWING';
  const isProcessingStep = step === 'PROCESSING';
  const isDone = step === 'RESULTS';
  const isError = step === 'ERROR';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'background 0.2s, color 0.2s' }}>
      <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '38px 30px 96px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Import Leads
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-2)', maxWidth: 640, lineHeight: 1.55 }}>
            Upload any lead export — Facebook, Google Ads, a real-estate CRM, or a hand-made spreadsheet. The AI maps its columns to the GrowEasy schema automatically.
          </p>
        </div>

        {/* Step progress rail — shown after upload */}
        {!isIdle && !isError && (
          <StepIndicator currentStep={step} />
        )}

        {/* STEP 1: Upload (IDLE or FILE_SELECTED parsing) */}
        {(isIdle || isFileSelected) && (
          <section style={{ marginBottom: 26 }}>
            <FileUploader
              onFileSelect={handleFileSelect}
              isLoading={isFileSelected}
              error={isError ? error : null}
            />
          </section>
        )}

        {/* STEP 2: Preview + Confirm */}
        {isPreviewing && parsedCSV && file && (
          <CSVPreview
            data={parsedCSV}
            fileName={file.name}
            fileSize={file.size}
            onConfirm={() => handleConfirmImport(file)}
            onReset={handleReset}
            isProcessing={isProcessing}
          />
        )}

        {/* STEP 3: Processing */}
        {isProcessingStep && <ProgressIndicator />}

        {/* STEP 4: Results */}
        {isDone && importResult && (
          <ImportResults data={importResult} onReset={handleReset} />
        )}

        {/* Error state */}
        {isError && (
          <section className="animate-fadeup" style={{
            padding: '48px 28px', textAlign: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 18, boxShadow: 'var(--shadow)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
              background: 'color-mix(in srgb, var(--conf-lo) 12%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="var(--conf-lo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
            <div style={{
              fontSize: 14, color: 'var(--text-2)', maxWidth: 420, margin: '0 auto 28px',
              padding: '12px 16px', background: 'var(--surface-2)',
              borderRadius: 10, border: '1px solid var(--border)',
              lineHeight: 1.6,
            }}>{error}</div>
            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 12,
                border: 'none', background: 'var(--accent)', color: 'var(--on-accent)',
                fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow)',
              }}
            >
              Start over
            </button>
          </section>
        )}

      </main>
    </div>
  );
}
