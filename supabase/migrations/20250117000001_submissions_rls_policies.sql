-- Row Level Security policies for submissions system
-- These policies ensure users can only access their own submissions and admins can moderate

-- Enable RLS on all new tables
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;

-- SUBMISSIONS TABLE POLICIES

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
    ON public.submissions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create new submissions
CREATE POLICY "Authenticated users can create submissions"
    ON public.submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions
CREATE POLICY "Users can update their own pending submissions"
    ON public.submissions
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
    ON public.submissions
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Admins can update submission status and feedback
CREATE POLICY "Admins can moderate submissions"
    ON public.submissions
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- SUBMISSION_DOCUMENTS TABLE POLICIES

-- Users can view documents for their own submissions
CREATE POLICY "Users can view their own submission documents"
    ON public.submission_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions 
            WHERE submissions.id = submission_documents.submission_id 
            AND submissions.user_id = auth.uid()
        )
    );

-- Users can upload documents to their own submissions
CREATE POLICY "Users can upload documents to their submissions"
    ON public.submission_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.submissions 
            WHERE submissions.id = submission_documents.submission_id 
            AND submissions.user_id = auth.uid()
            AND submissions.status = 'pending'
        )
    );

-- Users can delete documents from their pending submissions
CREATE POLICY "Users can delete their own submission documents"
    ON public.submission_documents
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions 
            WHERE submissions.id = submission_documents.submission_id 
            AND submissions.user_id = auth.uid()
            AND submissions.status = 'pending'
        )
    );

-- Admins can view all submission documents
CREATE POLICY "Admins can view all submission documents"
    ON public.submission_documents
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- USER_CONTRIBUTIONS TABLE POLICIES

-- Users can view their own contribution stats
CREATE POLICY "Users can view their own contributions"
    ON public.user_contributions
    FOR SELECT
    USING (auth.uid() = user_id);

-- System can create contribution records (via functions)
CREATE POLICY "System can manage user contributions"
    ON public.user_contributions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Admins can view all user contributions
CREATE POLICY "Admins can view all user contributions"
    ON public.user_contributions
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.submissions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.submission_documents TO authenticated;
GRANT SELECT ON public.user_contributions TO authenticated;

-- Grant admin permissions
GRANT ALL ON public.submissions TO service_role;
GRANT ALL ON public.submission_documents TO service_role;
GRANT ALL ON public.user_contributions TO service_role;