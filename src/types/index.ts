// types/index.ts - Unified TypeScript interfaces for Job Tinder application

export type ID = string;

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
export type Availability = "immediate" | "2_weeks" | "1_month" | "other";
export type UserRole = "employer" | "applicant";

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  is_public: boolean;
}

export interface Location {
  address?: string;
  city: string;
  state: string;
  country?: string;
  remote: boolean;
}

export interface EducationItem {
  degree: string;
  institution: string;
  graduation_year: number;
}

export interface WorkItem {
  company: string;
  position: string;
  start_date: string | Date;
  end_date?: string | Date;
  description: string;
}

export interface JobPosting {
  _id: ID;
  employer_id: ID;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  employment_type: EmploymentType;
  salary: SalaryRange;
  location: Location;
  skills_required: string[];
  benefits: string[];
  is_active: boolean;
  posted_at: string | Date;
  expires_at: string | Date;
  applicants_count?: number;
}

export interface JobApplication {
  _id: ID;
  job_id: ID;
  applicant_id: ID;
  status: ApplicationStatus;
  applied_at: string | Date;
  cover_letter?: string;
  custom_answers?: { question: string; answer: string }[];
  resume_url: string;
  notes?: string;
}

export interface ApplicantProfile {
  _id: ID;
  user_id: ID;
  name: string;
  email: string;
  phone: string;
  location: Omit<Location, "remote">;
  skills: string[];
  experience_years: number;
  education: EducationItem[];
  work_experience: WorkItem[];
  resume_url: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  availability: Availability;
  salary_expectation?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface EmployerProfile {
  _id: ID;
  user_id: ID;
  company_name: string;
  company_description: string;
  website: string;
  industry: string;
  company_size: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  social_links: {
    linkedin: string;
    twitter: string;
    facebook?: string;
  };
  logo_url: string;
  is_verified: boolean;
  founded_year?: number;
  employee_count?: number;
}

export interface User {
  _id: ID;
  clerk_id: ID;
  email: string;
  role: UserRole;
  created_at: string | Date;
  updated_at: string | Date;
  is_active: boolean;
}

export interface EmployerDashboardStats {
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  totalApplicants: number;
  applicantsToday: number;
  jobsExpiringThisWeek: number;
  recentApplications: JobApplication[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  employment_type: EmploymentType;
  salary: SalaryRange;
  location: Location;
  skills_required: string[];
  benefits: string[];
  expires_at: Date;
}

export interface CompanyFormData {
  company_name: string;
  company_description: string;
  website: string;
  industry: string;
  company_size: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  social_links: {
    linkedin: string;
    twitter: string;
    facebook?: string;
  };
  logo_url: string;
  founded_year?: number;
  employee_count?: number;
}

export type Applicant = Pick<ApplicantProfile, "_id" | "name" | "email" | "phone" | "skills" | "resume_url"> & {
  applied_at: string | Date;
};

export type EmployerJobListItem = Pick<
  JobPosting,
  "_id" | "title" | "description" | "employment_type" | "location" | "salary" | "is_active" | "posted_at" | "expires_at"
> & { applicants_count: number };
