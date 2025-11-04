-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_number INT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passcode VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create form_responses table to store user responses
CREATE TABLE IF NOT EXISTS public.form_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, section_id)
);

-- Create user_section_access table to track which sections users have unlocked
CREATE TABLE IF NOT EXISTS public.user_section_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, section_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form_responses_user_id ON public.form_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_section_id ON public.form_responses(section_id);
CREATE INDEX IF NOT EXISTS idx_user_section_access_user_id ON public.user_section_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_section_access_section_id ON public.user_section_access(section_id);

-- Enable Row Level Security
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_section_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view sections (they're public)
CREATE POLICY "Sections are viewable by everyone" ON public.sections
  FOR SELECT USING (true);

-- Users can only view their own responses
CREATE POLICY "Users can view their own responses" ON public.form_responses
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own responses
CREATE POLICY "Users can insert their own responses" ON public.form_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own responses
CREATE POLICY "Users can update their own responses" ON public.form_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own section access records
CREATE POLICY "Users can view their own section access" ON public.user_section_access
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own section access records
CREATE POLICY "Users can insert their own section access" ON public.user_section_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert seed data for the three sections
INSERT INTO public.sections (section_number, title, description, passcode)
VALUES
  (
    1,
    'Section 1: Background & Demographics',
    'Please provide information about your background and demographic details.',
    'SECTION1'
  ),
  (
    2,
    'Section 2: Experience & Perspectives',
    'Share your experiences and perspectives on the research topic.',
    'SECTION2'
  ),
  (
    3,
    'Section 3: Feedback & Recommendations',
    'Provide your feedback and recommendations for the research.',
    'SECTION3'
  )
ON CONFLICT (section_number) DO NOTHING;
