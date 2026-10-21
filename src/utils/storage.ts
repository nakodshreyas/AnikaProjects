import type { Review, LeadSubmission } from '../types';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Reviews

export function getStoredReviews(): Promise<Review[]> {
  return apiRequest<Review[]>('/api/reviews');
}

export function saveReviewToStorage(
  review: Review
): Promise<Review> {
  return apiRequest<Review>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(review),
  });
}

export function updateReviewPublicStatus(
  reviewId: string,
  showOnPublic: boolean
): Promise<Review> {
  return apiRequest<Review>(
    `/api/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ showOnPublic }),
    }
  );
}

export function saveAllReviewsToStorage(
  reviews: Review[]
): Promise<Review[]> {
  return apiRequest<Review[]>('/api/reviews', {
    method: 'PUT',
    body: JSON.stringify({ reviews }),
  });
}

// Leads

export function getStoredLeads(): Promise<LeadSubmission[]> {
  return apiRequest<LeadSubmission[]>('/api/leads');
}

export function saveLeadToStorage(
  lead: LeadSubmission
): Promise<LeadSubmission> {
  return apiRequest<LeadSubmission>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(lead),
  });
}

export function updateLeadStatusInStorage(
  id: string,
  status: NonNullable<LeadSubmission['status']>
): Promise<LeadSubmission> {
  return apiRequest<LeadSubmission>(
    `/api/leads/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  );
}
