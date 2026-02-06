-- Add education_level to schools
ALTER TABLE schools 
ADD COLUMN education_level VARCHAR(10) CHECK (education_level IN ('sd', 'smp', 'sma', 'smk'));

-- Create vocational_programs table (Jurusan)
CREATE TABLE vocational_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code),
    UNIQUE(school_id, name)
);

-- Index for vocational_programs
CREATE INDEX idx_vocational_programs_school_id ON vocational_programs(school_id);

-- Trigger for updated_at
CREATE TRIGGER update_vocational_programs_updated_at BEFORE UPDATE ON vocational_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
