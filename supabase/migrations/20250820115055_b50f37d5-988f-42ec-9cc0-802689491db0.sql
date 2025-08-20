-- Add metadata column to actions table for storing additional action details
ALTER TABLE public.actions 
ADD COLUMN metadata JSONB;