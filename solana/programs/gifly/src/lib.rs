use anchor_lang::prelude::*;

declare_id!("BsauxuUC9tQMiQjK3ChKpUn9TUnTmGjfA6dQgP7zzgpJ");

#[account]
pub struct BaseAccount {
  pub gifs: Vec<ItemStruct>,
  pub total_gifs: u64,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
  pub user_address: Pubkey,
  pub gif_link: String,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
  #[account(init, payer = user, space = 9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
}

#[program]
pub mod gifly {
  use super::*;
  pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_gifs = 0;
    Ok(())
  }
  pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> Result<()> {
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;
    let item = ItemStruct {
      user_address: *user.to_account_info().key,
      gif_link: gif_link.to_string(),
    };
    base_account.gifs.push(item);
    base_account.total_gifs += 1;
    Ok(())
  }
}
