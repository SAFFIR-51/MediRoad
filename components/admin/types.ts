/** 관리자 API 응답 타입 (docs/개편_사양.md 6장) */

export type InquiryStatus = "new" | "in_progress" | "done";

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = { new: "신규", in_progress: "상담중", done: "완료" };

export type Inquiry = {
  id: number;
  name: string;
  phone: string;
  email: string;
  department: string;
  region: string;
  openTiming: string;
  budget: string;
  deposit: string;
  rent: string;
  facilityCost: string;
  area: string;
  facility: string;
  consultType: string;
  message: string;
  status: InquiryStatus;
  memo: string;
  createdAt: string;
  updatedAt?: string;
};

export type Stats = {
  inquiriesNew: number;
  listingsOpen: number;
  listingsClosed: number;
  listingsHidden: number;
  listingsSample: number;
  members: number;
};

/** "2026-09-15 14:03:22" → "2026.09.15 14:03" */
export const fmtDateTime = (s?: string | null) => (s ? s.slice(0, 16).replace("T", " ").replace(/-/g, ".") : "");
