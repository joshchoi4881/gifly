const anchor = require("@project-serum/anchor");

const { SystemProgram } = anchor.web3;

const main = async () => {
  const program = anchor.workspace.Gifly;
  const baseAccount = anchor.web3.Keypair.generate();
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  let txn = await program.rpc.initialize({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  await program.rpc.addGif("insert_a_giphy_link_here", {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  });
  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
};

const run = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
