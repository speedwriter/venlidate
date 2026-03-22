-- ============================================================
-- VENLIDATE PHASE 2: ROADMAP SCHEMA
-- Run in Supabase SQL Editor
-- ============================================================

-- Extend existing idea table
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS roadmap_generated boolean DEFAULT false;

-- ============================================================
-- ROADMAP TABLE
-- ============================================================
CREATE TABLE roadmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  phase_count int DEFAULT 5 NOT NULL,
  current_phase int DEFAULT 1 NOT NULL,
  current_sprint int DEFAULT 1 NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')) NOT NULL,
  generated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roadmap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roadmaps" ON roadmap FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON roadmap FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON roadmap FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_roadmap_user ON roadmap(user_id);
CREATE INDEX idx_roadmap_idea ON roadmap(idea_id);

-- ============================================================
-- PHASE TABLE
-- ============================================================
CREATE TABLE phase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES roadmap(id) ON DELETE CASCADE NOT NULL,
  phase_number int NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  title text NOT NULL,
  description text NOT NULL,
  focus_area text NOT NULL,
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')) NOT NULL,
  unlocked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(roadmap_id, phase_number)
);

ALTER TABLE phase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own phases" ON phase FOR SELECT USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = phase.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can update own phases" ON phase FOR UPDATE USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = phase.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can insert own phases" ON phase FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = phase.roadmap_id AND r.user_id = auth.uid())
);
CREATE INDEX idx_phase_roadmap ON phase(roadmap_id);

-- ============================================================
-- SPRINT TABLE
-- ============================================================
CREATE TABLE sprint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid REFERENCES phase(id) ON DELETE CASCADE NOT NULL,
  roadmap_id uuid REFERENCES roadmap(id) ON DELETE CASCADE NOT NULL,
  sprint_number int NOT NULL,
  title text NOT NULL,
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')) NOT NULL,
  unlocked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phase_id, sprint_number)
);

ALTER TABLE sprint ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sprints" ON sprint FOR SELECT USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = sprint.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can update own sprints" ON sprint FOR UPDATE USING (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = sprint.roadmap_id AND r.user_id = auth.uid())
);
CREATE POLICY "Users can insert own sprints" ON sprint FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM roadmap r WHERE r.id = sprint.roadmap_id AND r.user_id = auth.uid())
);
CREATE INDEX idx_sprint_phase ON sprint(phase_id);
CREATE INDEX idx_sprint_roadmap ON sprint(roadmap_id);

-- ============================================================
-- TASK TABLE
-- ============================================================
CREATE TABLE task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid REFERENCES sprint(id) ON DELETE CASCADE NOT NULL,
  roadmap_id uuid REFERENCES roadmap(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  task_number int NOT NULL CHECK (task_number BETWEEN 1 AND 5),
  title text NOT NULL,
  description text NOT NULL,
  why_this_matters text NOT NULL,
  resource_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')) NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sprint_id, task_number)
);

ALTER TABLE task ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON task FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON task FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON task FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_task_sprint ON task(sprint_id);
CREATE INDEX idx_task_user ON task(user_id);
CREATE INDEX idx_task_roadmap ON task(roadmap_id);

-- ============================================================
-- TASK REFLECTION TABLE
-- ============================================================
CREATE TABLE task_reflection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES task(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL CHECK (char_length(content) >= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE task_reflection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reflections" ON task_reflection FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON task_reflection FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_reflection_task ON task_reflection(task_id);
CREATE INDEX idx_reflection_user ON task_reflection(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER (apply to all new tables)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_roadmap_updated_at BEFORE UPDATE ON roadmap FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_phase_updated_at BEFORE UPDATE ON phase FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprint_updated_at BEFORE UPDATE ON sprint FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON task FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
