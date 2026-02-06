-- Create Pending Registrations table
CREATE TABLE pending_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_name VARCHAR(255) NOT NULL,
    education_level VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    token UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for token lookups
CREATE INDEX idx_pending_registrations_token ON pending_registrations(token);

-- Add trigger for updated_at
CREATE TRIGGER update_pending_registrations_updated_at BEFORE UPDATE ON pending_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
