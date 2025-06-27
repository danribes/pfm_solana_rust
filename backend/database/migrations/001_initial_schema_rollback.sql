-- Rollback Migration: 001_initial_schema_rollback.sql
-- Description: Rollback script for initial database schema
-- Created: 2024-01-01
-- Author: System

-- This rollback script removes all objects created in the initial schema migration
-- Execute this script to completely remove the database schema

-- Drop views first
DROP VIEW IF EXISTS active_voting_questions;
DROP VIEW IF EXISTS community_members;
DROP VIEW IF EXISTS active_communities;

-- Drop triggers
DROP TRIGGER IF EXISTS update_question_vote_count_trigger ON votes;
DROP TRIGGER IF EXISTS update_community_member_count_trigger ON members;
DROP TRIGGER IF EXISTS update_voting_questions_updated_at ON voting_questions;
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_question_vote_count();
DROP FUNCTION IF EXISTS update_community_member_count();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_analytics_created_at;
DROP INDEX IF EXISTS idx_analytics_community_id;
DROP INDEX IF EXISTS idx_analytics_user_id;
DROP INDEX IF EXISTS idx_analytics_event_type;
DROP INDEX IF EXISTS idx_sessions_is_active;
DROP INDEX IF EXISTS idx_sessions_expires_at;
DROP INDEX IF EXISTS idx_sessions_session_token;
DROP INDEX IF EXISTS idx_sessions_user_id;
DROP INDEX IF EXISTS idx_votes_transaction_signature;
DROP INDEX IF EXISTS idx_votes_voted_at;
DROP INDEX IF EXISTS idx_votes_user_id;
DROP INDEX IF EXISTS idx_votes_question_id;
DROP INDEX IF EXISTS idx_voting_questions_is_active;
DROP INDEX IF EXISTS idx_voting_questions_voting_end_at;
DROP INDEX IF EXISTS idx_voting_questions_created_by;
DROP INDEX IF EXISTS idx_voting_questions_on_chain_id;
DROP INDEX IF EXISTS idx_voting_questions_community_id;
DROP INDEX IF EXISTS idx_members_joined_at;
DROP INDEX IF EXISTS idx_members_role;
DROP INDEX IF EXISTS idx_members_status;
DROP INDEX IF EXISTS idx_members_community_id;
DROP INDEX IF EXISTS idx_members_user_id;
DROP INDEX IF EXISTS idx_communities_is_active;
DROP INDEX IF EXISTS idx_communities_created_at;
DROP INDEX IF EXISTS idx_communities_created_by;
DROP INDEX IF EXISTS idx_communities_on_chain_id;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_wallet_address;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS analytics;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS voting_questions;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS communities;
DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp"; 