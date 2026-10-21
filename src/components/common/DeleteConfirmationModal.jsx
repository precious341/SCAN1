import React, { useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Medical Report',
  message = 'Are you sure you want to delete this medical report? This action cannot be undone.',
  itemTitle = null,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDeleting = false,
  isDangerAll = false,
}) {
  const confirmBtnRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  // Focus confirm button when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isDangerAll 
              ? 'bg-rose-100 text-rose-600 border border-rose-200 ring-4 ring-rose-50' 
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {isDangerAll ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <Trash2 className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3 id="delete-dialog-title" className="text-base sm:text-lg font-bold text-[#0B192C] leading-snug">
              {title}
            </h3>
            <p id="delete-dialog-description" className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Title context box if provided */}
        {itemTitle && (
          <div className="mx-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">Selected Report</span>
            <span className="font-bold text-[#0B192C] truncate block mt-0.5">{itemTitle}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 pt-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {cancelText}
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-60 ${
              isDangerAll
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-900/20'
                : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-900/20'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
