-- This SQL will update your database to have default values for id and updatedAt fields

-- For all tables that have id columns, set default to UUID
ALTER TABLE courses ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE lessons ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE accounts ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE sessions ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE progress ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE playback_heartbeats ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- For all tables with updatedAt, add a trigger to auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table with updatedAt
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Also set default for updatedAt on INSERT
ALTER TABLE courses ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE lessons ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE progress ALTER COLUMN "updatedAt" SET DEFAULT NOW();

