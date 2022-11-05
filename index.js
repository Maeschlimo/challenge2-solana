// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

//generate 2 wallets
const from = Keypair.generate();
const to = Keypair.generate();

var walletBalanceFrom = 0;
console.log("Users Adress from is: "+ from.publicKey);
console.log("Users Adress to is: "+ to.publicKey);

// Connect to the Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Get the wallet balance from a given publickey
const getWalletBalance = async () => {
    try {

        //get Wallet balance
        const walletBalanceTo = await connection.getBalance(
            new PublicKey(to.publicKey)
        );
        walletBalanceFrom = await connection.getBalance(
            new PublicKey(from.publicKey)
        );

        console.log(`Wallet balance From: ${parseInt(walletBalanceFrom) / LAMPORTS_PER_SOL} SOL`);
        console.log(`Wallet balance To: ${parseInt(walletBalanceTo) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }
};
const airDropSol = async() => {

    // Aidrop 4 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");
}
    
const transferSol = async() => {

    const amountToSend = (parseInt(walletBalanceFrom) / LAMPORTS_PER_SOL)/2;
    console.log('Amount Transfering: '+amountToSend + ' SOL')
    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: walletBalanceFrom/2
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
}




async function main() {
    await getWalletBalance();
    await airDropSol();
    await getWalletBalance();
    await transferSol();
    await getWalletBalance();
}

main();



