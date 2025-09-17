-- Create submissions system tables
-- This migration adds the core tables needed for user-submitted legislation

-- Create enum types for submissions
CREATE TYPE submission_type AS ENUM ('new_legislation', 'update_existing');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'needs_changes');

-- Create submissions table
CREATE TABLE public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type submission_type NOT NULL,
    status submission_status DEFAULT 'pending' NOT NULL,
    original_record_id UUID REFERENCES public.breed_legislation(id) ON DELETE SET NULL,
    submitted_data JSONB NOT NULL,
    admin_feedback TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create submission_documents table for file attachments
CREATE TABLE public.submission_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_contributions table for tracking user stats
CREATE TABLE public.user_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    submission_count INTEGER DEFAULT 0 NOT NULL,
    approved_count INTEGER DEFAULT 0 NOT NULL,
    rejected_count INTEGER DEFAULT 0 NOT NULL,
    reputation_score INTEGER DEFAULT 0 NOT NULL,
    last_contribution TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_type ON public.submissions(type);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX idx_submissions_original_record ON public.submissions(original_record_id);
CREATE INDEX idx_submission_documents_submission_id ON public.submission_documents(submission_id);
CREATE INDEX idx_user_contributions_user_id ON public.user_contributions(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_contributions_updated_at
    BEFORE UPDATE ON public.user_contributions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.submissions IS 'User-submitted breed legislation records and updates';
COMMENT ON TABLE public.submission_documents IS 'File attachments for submissions (ordinance PDFs, etc.)';
COMMENT ON TABLE public.user_contributions IS 'User contribution statistics and reputation tracking';

COMMENT ON COLUMN public.submissions.submitted_data IS 'JSON containing the legislation data (municipality, state, banned_breeds, etc.)';
COMMENT ON COLUMN public.submissions.original_record_id IS 'For updates: references the existing breed_legislation record being updated';
COMMENT ON COLUMN public.user_contributions.reputation_score IS 'Calculated score based on submission quality and approval rate';