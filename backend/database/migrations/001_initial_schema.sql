-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for community management application
-- Created: 2024-01-01
-- Author: System

-- This migration creates the complete initial schema for the community management application
-- It includes all tables, indexes, triggers, functions, and views

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - User profiles and wallet associations
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(44) UNIQUE NOT NULL, -- Solana wallet address
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Communities table - Community metadata and configuration
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    on_chain_id VARCHAR(44) UNIQUE NOT NULL, -- Solana account address
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    discord_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    member_count INTEGER DEFAULT 0,
    -- Community settings
    require_approval BOOLEAN DEFAULT TRUE,
    allow_public_voting BOOLEAN DEFAULT FALSE,
    max_members INTEGER,
    voting_threshold INTEGER DEFAULT 1 -- Minimum votes required for decisions
);

-- Members table - Community membership records
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'banned')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, community_id)
);

-- Voting questions table - Question metadata and analytics
CREATE TABLE voting_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    on_chain_id VARCHAR(44) UNIQUE NOT NULL, -- Solana account address
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_type VARCHAR(20) NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice', 'ranked_choice')),
    options JSONB NOT NULL, -- Array of voting options
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    voting_start_at TIMESTAMP WITH TIME ZONE,
    voting_end_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    total_votes INTEGER DEFAULT 0,
    -- Question settings
    allow_anonymous_voting BOOLEAN DEFAULT FALSE,
    require_member_approval BOOLEAN DEFAULT FALSE,
    min_votes_required INTEGER DEFAULT 1
);

-- Votes table - Vote records for analytics and reporting
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES voting_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_options JSONB NOT NULL, -- Array of selected option indices
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_signature VARCHAR(88), -- Solana transaction signature
    is_anonymous BOOLEAN DEFAULT FALSE,
    UNIQUE(question_id, user_id)
);

-- Sessions table - User session management
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(44) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Analytics table - Usage and performance metrics
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES users(id),
    community_id UUID REFERENCES communities(id),
    question_id UUID REFERENCES voting_questions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_communities_on_chain_id ON communities(on_chain_id);
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_created_at ON communities(created_at);
CREATE INDEX idx_communities_is_active ON communities(is_active);

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_community_id ON members(community_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_joined_at ON members(joined_at);

CREATE INDEX idx_voting_questions_community_id ON voting_questions(community_id);
CREATE INDEX idx_voting_questions_on_chain_id ON voting_questions(on_chain_id);
CREATE INDEX idx_voting_questions_created_by ON voting_questions(created_by);
CREATE INDEX idx_voting_questions_voting_end_at ON voting_questions(voting_end_at);
CREATE INDEX idx_voting_questions_is_active ON voting_questions(is_active);

CREATE INDEX idx_votes_question_id ON votes(question_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_voted_at ON votes(voted_at);
CREATE INDEX idx_votes_transaction_signature ON votes(transaction_signature);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_community_id ON analytics(community_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voting_questions_updated_at BEFORE UPDATE ON voting_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE communities 
        SET member_count = member_count + 1 
        WHERE id = NEW.community_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE communities 
        SET member_count = member_count - 1 
        WHERE id = OLD.community_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for member count updates
CREATE TRIGGER update_community_member_count_trigger 
    AFTER INSERT OR DELETE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_question_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE voting_questions 
        SET total_votes = total_votes + 1 
        WHERE id = NEW.question_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE voting_questions 
        SET total_votes = total_votes - 1 
        WHERE id = OLD.question_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for vote count updates
CREATE TRIGGER update_question_vote_count_trigger 
    AFTER INSERT OR DELETE ON votes 
    FOR EACH ROW EXECUTE FUNCTION update_question_vote_count();

-- Create views for common queries
CREATE VIEW active_communities AS
SELECT * FROM communities WHERE is_active = TRUE;

CREATE VIEW community_members AS
SELECT 
    c.id as community_id,
    c.name as community_name,
    u.id as user_id,
    u.username,
    u.wallet_address,
    m.role,
    m.status,
    m.joined_at
FROM communities c
JOIN members m ON c.id = m.community_id
JOIN users u ON m.user_id = u.id
WHERE c.is_active = TRUE AND m.status = 'approved';

CREATE VIEW active_voting_questions AS
SELECT 
    vq.*,
    c.name as community_name,
    u.username as created_by_username
FROM voting_questions vq
JOIN communities c ON vq.community_id = c.id
JOIN users u ON vq.created_by = u.id
WHERE vq.is_active = TRUE 
AND (vq.voting_end_at IS NULL OR vq.voting_end_at > NOW());

-- Add comments for documentation
COMMENT ON TABLE users IS 'User profiles and wallet associations';
COMMENT ON TABLE communities IS 'Community metadata and configuration';
COMMENT ON TABLE members IS 'Community membership records';
COMMENT ON TABLE voting_questions IS 'Voting question metadata and analytics';
COMMENT ON TABLE votes IS 'Vote records for analytics and reporting';
COMMENT ON TABLE sessions IS 'User session management';
COMMENT ON TABLE analytics IS 'Usage and performance metrics'; 