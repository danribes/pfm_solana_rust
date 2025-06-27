use anchor_lang::prelude::*;

// Program ID
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgMQoezjGvEJ");

// Community configuration struct
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct CommunityConfig {
    pub voting_period: i64, // Voting period in seconds
    pub max_options: u8,    // Maximum number of options per question (e.g., 4)
}

// Community account
#[account]
pub struct Community {
    pub admin: Pubkey,           // Community admin/creator
    pub name: String,            // Community name
    pub description: String,     // Community description
    pub member_count: u32,       // Number of approved members
    pub created_at: i64,         // Timestamp
    pub config: CommunityConfig, // Voting rules/config
}

// Member account
#[account]
pub struct Member {
    pub community: Pubkey, // Reference to Community
    pub wallet: Pubkey,    // Member's wallet address
    pub role: u8,          // 0 = member, 1 = admin
    pub joined_at: i64,    // Timestamp
    pub status: u8,        // 0 = pending, 1 = approved, 2 = rejected
}

// VotingQuestion account
#[account]
pub struct VotingQuestion {
    pub community: Pubkey,     // Reference to Community
    pub creator: Pubkey,       // Creator of the question
    pub question: String,      // The question text
    pub options: Vec<String>,  // Up to 4 options
    pub deadline: i64,         // Voting deadline (timestamp)
    pub created_at: i64,       // Timestamp
    pub is_active: bool,       // Is the question active?
}

// Vote account
#[account]
pub struct Vote {
    pub question: Pubkey,      // Reference to VotingQuestion
    pub voter: Pubkey,         // Voter's wallet address
    pub selected_option: u8,   // Index of selected option
    pub voted_at: i64,         // Timestamp
}

// Add custom error codes for validation
#[error_code]
pub enum VotingError {
    #[msg("Community name is too long")] 
    NameTooLong,
    #[msg("Community description is too long")] 
    DescriptionTooLong,
    #[msg("Voting period must be positive")] 
    InvalidVotingPeriod,
    #[msg("Max options must be between 2 and 4")] 
    InvalidMaxOptions,
}

#[error_code]
pub enum MemberError {
    #[msg("Member already exists in this community")]
    AlreadyMember,
}

#[error_code]
pub enum ApprovalError {
    #[msg("Only the community admin can approve or reject members")]
    NotAdmin,
    #[msg("Member is not pending approval")]
    NotPending,
}

#[error_code]
pub enum VotingQuestionError {
    #[msg("Only approved members can create voting questions")]
    NotApprovedMember,
    #[msg("Question is too long")]
    QuestionTooLong,
    #[msg("Too many options")]
    TooManyOptions,
    #[msg("Deadline must be in the future")]
    InvalidDeadline,
    #[msg("Voting question is not active")]
    NotActive,
    #[msg("Voting deadline has passed")]
    DeadlinePassed,
    #[msg("Invalid option selected")]
    InvalidOption,
    #[msg("Member has already voted on this question")]
    AlreadyVoted,
}

#[error_code]
pub enum AdminActionError {
    #[msg("Only the community admin can perform this action")]
    NotAdmin,
    #[msg("Community is already dissolved")]
    CommunityDissolved,
    #[msg("Member is not approved")]
    NotApproved,
    #[msg("Member is already removed or rejected")]
    AlreadyRemoved,
}

#[error_code]
pub enum EdgeCaseError {
    #[msg("Community is dissolved; action not allowed")]
    CommunityDissolved,
    #[msg("Member is removed or rejected; action not allowed")]
    MemberInactive,
    #[msg("Member is already pending or approved")]
    AlreadyActive,
}

// --- Event Structs ---

#[event]
pub struct CommunityCreated {
    pub community: Pubkey,
    pub admin: Pubkey,
    pub name: String,
    pub timestamp: i64,
}

#[event]
pub struct MemberJoined {
    pub community: Pubkey,
    pub member_wallet: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct MemberApproved {
    pub community: Pubkey,
    pub member_wallet: Pubkey,
    pub admin: Pubkey,
    pub status: u8, // 1 = approved, 2 = rejected
    pub timestamp: i64,
}

#[event]
pub struct MemberRemoved {
    pub community: Pubkey,
    pub member_wallet: Pubkey,
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct CommunityDissolved {
    pub community: Pubkey,
    pub admin: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VotingQuestionCreated {
    pub community: Pubkey,
    pub question: Pubkey,
    pub creator: Pubkey,
    pub deadline: i64,
    pub timestamp: i64,
}

#[event]
pub struct VoteCast {
    pub question: Pubkey,
    pub voter: Pubkey,
    pub selected_option: u8,
    pub timestamp: i64,
}

#[event]
pub struct VotingQuestionClosed {
    pub question: Pubkey,
    pub closer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct MemberRoleChanged {
    pub community: Pubkey,
    pub member_wallet: Pubkey,
    pub new_role: u8, // 0 = member, 1 = admin
    pub changed_by: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum RoleManagementError {
    #[msg("Only the current admin can change member roles")]
    NotAdmin,
    #[msg("Cannot demote self without assigning a new admin")]
    CannotDemoteSelf,
    #[msg("Target member is not approved")]
    NotApprovedMember,
    #[msg("Target is already the desired role")]
    AlreadyRole,
}

#[derive(Accounts)]
pub struct CreateCommunity<'info> {
    #[account(
        init,
        payer = admin,
        space = 368, // 8 + 32 + (4+32) + (4+256) + 4 + 8 + 8 + 1 (see review)
    )]
    pub community: Account<'info, Community>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinCommunity<'info> {
    #[account(mut)]
    pub community: Account<'info, Community>,
    #[account(
        init_if_needed,
        payer = user,
        space = 96, // 8 + 32 + 32 + 1 + 8 + 1 (see review)
        seeds = [b"member", community.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveMember<'info> {
    #[account(mut)]
    pub community: Account<'info, Community>,
    #[account(mut, has_one = community)]
    pub member: Account<'info, Member>,
    #[account(signer)]
    pub admin: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CreateVotingQuestion<'info> {
    #[account(mut)]
    pub community: Account<'info, Community>,
    #[account(
        mut,
        has_one = community,
        constraint = member.status == 1 @ VotingQuestionError::NotApprovedMember,
    )]
    pub member: Account<'info, Member>,
    #[account(
        init,
        payer = creator,
        space = 512, // 8 + 32 + 32 + (4+256) + 4 + (4*(4+32)) + 8 + 8 + 1 (see review)
        seeds = [b"question", community.key().as_ref(), creator.key().as_ref(), &[Clock::get()?.unix_timestamp as u8]],
        bump,
    )]
    pub voting_question: Account<'info, VotingQuestion>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voting_question: Account<'info, VotingQuestion>,
    #[account(
        mut,
        has_one = community,
        constraint = member.status == 1 @ VotingQuestionError::NotApprovedMember,
    )]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        init,
        payer = voter,
        space = 96, // 8 + 32 + 32 + 1 + 8 (see review)
        seeds = [b"vote", voting_question.key().as_ref(), voter.key().as_ref()],
        bump,
    )]
    pub vote: Account<'info, Vote>,
    pub community: Account<'info, Community>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseVotingQuestion<'info> {
    #[account(mut)]
    pub voting_question: Account<'info, VotingQuestion>,
    pub closer: Signer<'info>,
}

#[derive(Accounts)]
pub struct RemoveMember<'info> {
    #[account(mut)]
    pub community: Account<'info, Community>,
    #[account(mut, has_one = community)]
    pub member: Account<'info, Member>,
    #[account(signer)]
    pub admin: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct DissolveCommunity<'info> {
    #[account(mut)]
    pub community: Account<'info, Community>,
    #[account(signer)]
    pub admin: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateCommunityConfig<'info> {
    #[account(
        mut,
        has_one = admin @ AdminActionError::NotAdmin
    )]
    pub community: Account<'info, Community>,
    #[account(signer)]
    pub admin: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ChangeMemberRole<'info> {
    #[account(mut, has_one = admin)]
    pub community: Account<'info, Community>,
    #[account(mut, has_one = community)]
    pub member: Account<'info, Member>,
    #[account(signer)]
    pub admin: AccountInfo<'info>,
}

#[program]
pub mod voting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn create_community(
        ctx: Context<CreateCommunity>,
        name: String,
        description: String,
        config: CommunityConfig,
    ) -> Result<()> {
        // Constraints
        let max_name_len = 32;
        let max_desc_len = 256;
        if name.len() > max_name_len {
            return err!(VotingError::NameTooLong);
        }
        if description.len() > max_desc_len {
            return err!(VotingError::DescriptionTooLong);
        }
        if config.voting_period <= 0 {
            return err!(VotingError::InvalidVotingPeriod);
        }
        if config.max_options < 2 || config.max_options > 4 {
            return err!(VotingError::InvalidMaxOptions);
        }

        let community = &mut ctx.accounts.community;
        community.admin = ctx.accounts.admin.key();
        community.name = name;
        community.description = description;
        community.member_count = 1;
        community.created_at = Clock::get()?.unix_timestamp;
        community.config = config;
        let now = Clock::get()?.unix_timestamp;
        emit!(CommunityCreated {
            community: ctx.accounts.community.key(),
            admin: ctx.accounts.admin.key(),
            name: ctx.accounts.community.name.clone(),
            timestamp: now,
        });
        Ok(())
    }

    pub fn join_community(ctx: Context<JoinCommunity>) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let member = &mut ctx.accounts.member;
        // Prevent joining if community is dissolved
        if community.member_count == u32::MAX {
            return err!(EdgeCaseError::CommunityDissolved);
        }
        // Allow re-application only if previously rejected or removed
        if member.status == 0 || member.status == 1 {
            return err!(EdgeCaseError::AlreadyActive);
        }
        member.community = community.key();
        member.wallet = ctx.accounts.user.key();
        member.role = 0; // regular member
        member.joined_at = Clock::get()?.unix_timestamp;
        member.status = 0; // 0 = pending
        let now = Clock::get()?.unix_timestamp;
        emit!(MemberJoined {
            community: ctx.accounts.community.key(),
            member_wallet: ctx.accounts.user.key(),
            timestamp: now,
        });
        Ok(())
    }

    pub fn approve_member(
        ctx: Context<ApproveMember>,
        approve: bool, // true = approve, false = reject
    ) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let member = &mut ctx.accounts.member;
        let admin = &ctx.accounts.admin;

        // Only the community admin can approve/reject
        if community.admin != *admin.key {
            return err!(ApprovalError::NotAdmin);
        }
        // Only pending members can be approved/rejected
        if member.status != 0 {
            return err!(ApprovalError::NotPending);
        }
        if approve {
            member.status = 1; // approved
            community.member_count = community.member_count.checked_add(1).ok_or(ProgramError::InvalidArgument)?;
            msg!("Member {} approved by admin {}", member.wallet, admin.key);
        } else {
            member.status = 2; // rejected
            msg!("Member {} rejected by admin {}", member.wallet, admin.key);
        }
        let now = Clock::get()?.unix_timestamp;
        emit!(MemberApproved {
            community: ctx.accounts.community.key(),
            member_wallet: member.wallet,
            admin: *admin.key,
            status: member.status,
            timestamp: now,
        });
        Ok(())
    }

    pub fn create_voting_question(
        ctx: Context<CreateVotingQuestion>,
        question: String,
        options: Vec<String>,
        deadline: i64,
    ) -> Result<()> {
        let community = &ctx.accounts.community;
        let member = &ctx.accounts.member;
        // Prevent if community is dissolved
        if community.member_count == u32::MAX {
            return err!(EdgeCaseError::CommunityDissolved);
        }
        // Prevent if member is not approved
        if member.status != 1 {
            return err!(EdgeCaseError::MemberInactive);
        }
        let max_question_len = 256;
        let max_options = 4;
        let min_options = 2;
        let now = Clock::get()?.unix_timestamp;
        if question.len() > max_question_len {
            return err!(VotingQuestionError::QuestionTooLong);
        }
        if options.len() < min_options || options.len() > max_options {
            return err!(VotingQuestionError::TooManyOptions);
        }
        if deadline <= now {
            return err!(VotingQuestionError::InvalidDeadline);
        }
        let voting_question = &mut ctx.accounts.voting_question;
        voting_question.community = ctx.accounts.community.key();
        voting_question.creator = ctx.accounts.creator.key();
        voting_question.question = question;
        voting_question.options = options;
        voting_question.deadline = deadline;
        voting_question.created_at = now;
        voting_question.is_active = true;
        emit!(VotingQuestionCreated {
            community: ctx.accounts.community.key(),
            question: ctx.accounts.voting_question.key(),
            creator: ctx.accounts.creator.key(),
            deadline: deadline,
            timestamp: now,
        });
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        selected_option: u8,
    ) -> Result<()> {
        let voting_question = &mut ctx.accounts.voting_question;
        let member = &ctx.accounts.member;
        let community = &ctx.accounts.community;
        let now = Clock::get()?.unix_timestamp;
        // Prevent if community is dissolved
        if community.member_count == u32::MAX {
            return err!(EdgeCaseError::CommunityDissolved);
        }
        // Prevent if member is not approved
        if member.status != 1 {
            return err!(EdgeCaseError::MemberInactive);
        }
        if !voting_question.is_active {
            return err!(VotingQuestionError::NotActive);
        }
        if now > voting_question.deadline {
            return err!(VotingQuestionError::DeadlinePassed);
        }
        if selected_option as usize >= voting_question.options.len() {
            return err!(VotingQuestionError::InvalidOption);
        }
        let vote = &mut ctx.accounts.vote;
        vote.question = voting_question.key();
        vote.voter = ctx.accounts.voter.key();
        vote.selected_option = selected_option;
        vote.voted_at = now;
        emit!(VoteCast {
            question: vote.question,
            voter: vote.voter,
            selected_option: vote.selected_option,
            timestamp: now,
        });
        Ok(())
    }

    pub fn close_voting_question(
        ctx: Context<CloseVotingQuestion>,
    ) -> Result<()> {
        let voting_question = &mut ctx.accounts.voting_question;
        let now = Clock::get()?.unix_timestamp;
        if now < voting_question.deadline {
            return err!(VotingQuestionError::DeadlinePassed);
        }
        voting_question.is_active = false;
        emit!(VotingQuestionClosed {
            question: ctx.accounts.voting_question.key(),
            closer: ctx.accounts.closer.key(),
            timestamp: now,
        });
        Ok(())
    }

    pub fn remove_member(
        ctx: Context<RemoveMember>,
    ) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let member = &mut ctx.accounts.member;
        let admin = &ctx.accounts.admin;
        if community.admin != *admin.key {
            return err!(AdminActionError::NotAdmin);
        }
        if member.status != 1 {
            return err!(AdminActionError::NotApproved);
        }
        // Mark member as removed (status = 3)
        member.status = 3;
        // Decrement member_count safely
        if community.member_count > 0 {
            community.member_count -= 1;
        }
        msg!("Member {} removed by admin {}", member.wallet, admin.key);
        let now = Clock::get()?.unix_timestamp;
        emit!(MemberRemoved {
            community: ctx.accounts.community.key(),
            member_wallet: member.wallet,
            admin: *admin.key,
            timestamp: now,
        });
        Ok(())
    }

    pub fn dissolve_community(
        ctx: Context<DissolveCommunity>,
    ) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let admin = &ctx.accounts.admin;
        if community.admin != *admin.key {
            return err!(AdminActionError::NotAdmin);
        }
        // Mark community as dissolved by setting member_count to u32::MAX (sentinel)
        if community.member_count == u32::MAX {
            return err!(AdminActionError::CommunityDissolved);
        }
        community.member_count = u32::MAX;
        msg!("Community {} dissolved by admin {}", community.key(), admin.key);
        let now = Clock::get()?.unix_timestamp;
        emit!(CommunityDissolved {
            community: ctx.accounts.community.key(),
            admin: *admin.key,
            timestamp: now,
        });
        Ok(())
    }

    pub fn update_community_config(
        ctx: Context<UpdateCommunityConfig>,
        new_config: CommunityConfig,
    ) -> Result<()> {
        // Validation for the new config
        if new_config.voting_period <= 0 {
            return err!(VotingError::InvalidVotingPeriod);
        }
        if new_config.max_options < 2 || new_config.max_options > 4 {
            return err!(VotingError::InvalidMaxOptions);
        }

        let community = &mut ctx.accounts.community;
        community.config = new_config;
        
        msg!("Community config updated by admin {}", ctx.accounts.admin.key);
        Ok(())
    }

    pub fn change_member_role(
        ctx: Context<ChangeMemberRole>,
        new_role: u8, // 0 = member, 1 = admin
    ) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let member = &mut ctx.accounts.member;
        let admin = &ctx.accounts.admin;
        let now = Clock::get()?.unix_timestamp;

        // Only the current admin can change roles
        if community.admin != *admin.key {
            return err!(RoleManagementError::NotAdmin);
        }
        // Only approved members can be promoted/demoted
        if member.status != 1 {
            return err!(RoleManagementError::NotApprovedMember);
        }
        // No-op if already the desired role
        if member.role == new_role {
            return err!(RoleManagementError::AlreadyRole);
        }
        // If promoting to admin, update both member.role and community.admin
        if new_role == 1 {
            member.role = 1;
            community.admin = member.wallet;
        } else {
            // If demoting self, prevent unless another admin is assigned
            if member.wallet == *admin.key {
                return err!(RoleManagementError::CannotDemoteSelf);
            }
            member.role = 0;
        }
        emit!(MemberRoleChanged {
            community: community.key(),
            member_wallet: member.wallet,
            new_role,
            changed_by: *admin.key,
            timestamp: now,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
