-- Drop all policies first
DROP POLICY IF EXISTS "Users can update their own actions" ON public.actions;
DROP POLICY IF EXISTS "Authenticated users can create actions" ON public.actions;
DROP POLICY IF EXISTS "Users can view actions" ON public.actions;

-- Recreate the table with correct data types
DROP TABLE IF EXISTS public.actions;

CREATE TABLE public.actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- Create relaxed policies for demo
CREATE POLICY "Anyone can view actions (demo)"
ON public.actions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create actions (demo)"
ON public.actions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update actions (demo)"
ON public.actions
FOR UPDATE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_actions_updated_at
  BEFORE UPDATE ON public.actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_actions_case_id ON public.actions(case_id);
CREATE INDEX idx_actions_agent_id ON public.actions(agent_id);