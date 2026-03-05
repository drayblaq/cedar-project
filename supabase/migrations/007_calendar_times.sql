-- Migration to add start_time and end_time to calendar_events for the weekly view

ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS start_time time,
ADD COLUMN IF NOT EXISTS end_time time;

-- We can leave them nullable, meaning if they are null, the event is an "all-day" event.
