'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { CustomerBottomNav } from '../../components/customer/CustomerBottomNav';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { feedbackApi } from '../../lib/api/feedback';
import { CustomerFeedback } from '../../types/feedback';
import { useAppSelector } from '../../store';
import {
  Star,
  CheckCircle2,
  Utensils,
  UserCheck,
  Smartphone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

interface StarRatingPickerProps {
  label: string;
  sublabel: string;
  value: number;
  onChange: (val: number) => void;
  icon: React.FC<{ className?: string }>;
}

const StarRatingPicker: React.FC<StarRatingPickerProps> = ({
  label,
  sublabel,
  value,
  onChange,
  icon: CategoryIcon,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
          <CategoryIcon className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-stone-900 text-sm block">{label}</span>
          <span className="text-[11px] text-stone-500 block">{sublabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 transition-transform hover:scale-115 focus:outline-none"
              aria-label={`Rate ${star} out of 5 stars for ${label}`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-100'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          {value} / 5
        </span>
      </div>
    </div>
  );
};

export default function FeedbackPage() {
  const session = useAppSelector((state) => state.customerSession);
  const tableNumber = session.table?.tableNumber || 12;
  const tableId = session.table?.id || 'tbl-12';
  const sessionId = session.sessionId || 'sess-demo-12';
  const customerName = session.customerName || 'Guest';

  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [orderingRating, setOrderingRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingFeedback, setExistingFeedback] = useState<CustomerFeedback | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<CustomerFeedback | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check if customer already left feedback for this session
  useEffect(() => {
    async function checkExistingFeedback() {
      try {
        setLoading(true);
        const existing = await feedbackApi.getFeedbackForSession(sessionId);
        if (existing) {
          setExistingFeedback(existing);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkExistingFeedback();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingFeedback) {
      setToast({
        title: 'Feedback Already Submitted',
        message: 'You have already submitted feedback for this dining session.',
        type: 'info',
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await feedbackApi.submitFeedback({
        tableId,
        tableNumber,
        sessionId,
        customerName,
        foodRating,
        serviceRating,
        orderingRating,
        comments: comments.trim() || undefined,
      });

      setSubmittedFeedback(res);
      setToast({
        title: 'Thank you!',
        message: 'Thank you for your feedback.',
        type: 'success',
      });
    } catch (err: any) {
      setToast({
        title: 'Submission Error',
        message: err.message || 'Failed to submit feedback.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeReview = submittedFeedback || existingFeedback;

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8 flex flex-col">
      <CustomerHeader />

      {toast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
        {/* Title Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Dining Experience Review</h1>
            <p className="text-xs text-stone-500">Table #{tableNumber} • Help us improve our service</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
            Table #{tableNumber}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <span className="text-xs font-bold text-stone-400">Checking dining review status...</span>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
                <Skeleton className="h-5 w-48 rounded" />
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Skeleton key={star} className="h-8 w-8 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        ) : activeReview ? (
          /* SUCCESS OR ALREADY SUBMITTED STATE */
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900 mb-1">Thank you for your feedback.</h2>
              <p className="text-xs text-stone-500">
                Your input helps our culinary and service teams continuously refine your dining experience.
              </p>
            </div>

            {/* Ratings Summary Card */}
            <div className="bg-stone-50 rounded-2xl p-4 text-left text-xs space-y-3 border border-stone-200/70">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block">
                Submitted Ratings Overview
              </span>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" /> Food & Taste
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-extrabold text-stone-900">{activeReview.foodRating} / 5</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Service Quality
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-extrabold text-stone-900">{activeReview.serviceRating} / 5</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" /> Ordering Experience
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-extrabold text-stone-900">{activeReview.orderingRating} / 5</span>
                  </div>
                </div>
              </div>

              {activeReview.comments && (
                <div className="pt-2 border-t border-stone-200/80">
                  <span className="text-[10px] text-stone-400 font-semibold block mb-0.5">Your Comment</span>
                  <p className="text-xs text-stone-700 italic bg-white p-2.5 rounded-xl border border-stone-200">
                    &quot;{activeReview.comments}&quot;
                  </p>
                </div>
              )}

              <span className="text-[10px] text-stone-400 block pt-1">{formatDateTime(activeReview.createdAt)}</span>
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-amber-600 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-amber-700"
            >
              Return to Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* FEEDBACK FORM FORM CONTAINER */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating 1: Food rating */}
            <StarRatingPicker
              label="Food & Culinary Quality"
              sublabel="Taste, freshness, presentation & temperature"
              value={foodRating}
              onChange={setFoodRating}
              icon={Utensils}
            />

            {/* Rating 2: Service rating */}
            <StarRatingPicker
              label="Staff Service & Hospitality"
              sublabel="Friendliness, speed & responsiveness"
              value={serviceRating}
              onChange={setServiceRating}
              icon={UserCheck}
            />

            {/* Rating 3: Ordering experience rating */}
            <StarRatingPicker
              label="Digital Ordering Experience"
              sublabel="Menu navigation, speed & clarity"
              value={orderingRating}
              onChange={setOrderingRating}
              icon={Smartphone}
            />

            {/* Optional Comment */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Optional Comment or Suggestions
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share any special dish compliments or areas where we can improve..."
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                disabled={submitting}
                className="w-full py-4 text-sm font-extrabold rounded-2xl shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Submit Review
              </Button>

              <p className="text-[11px] text-stone-400 text-center">
                Feedback is completely optional and non-binding.
              </p>
            </div>
          </form>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
}
