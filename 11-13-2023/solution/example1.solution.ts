/*
  Example 1:
  - Type simplifcation
  - Use const instead of let
  - Using early returns for more readable control flow
  - Pure vs procedrual functions
*/

import { connectClient, getAddressesStoredSource1, getAddressesStoredSource2, getAddressesStoredSource3, getAddressesStoredSource4, getDbWallet, getSavedTransactions } from "../stubs";

export type SavedData = {
  walletAddress,
  savedTransactions,
  savedAddressesDataSource1,
  savedAddressesDataSource2,
  savedAddressesDataSource3,
  savedAddressesDataSource4,
}

export type savedAddresses = {
  address: string;
  has_content: boolean;
  created_at: string;
};

export enum TransactionDirection {
  Incoming = "incoming",
  Outgoing = "outgoing",
  InAndOut = "in/out",
}

export type TransactionDirections =
  | TransactionDirection.Incoming
  | TransactionDirection.Outgoing
  | TransactionDirection.InAndOut;


/* 1) Type simplification: introduce reference types (Token, BaseToken, etc.) */
export type BaseToken = {
  address: string;
}

export type Erc721Token = BaseToken & {
  erc721TokenId: string;
}

export type Erc1155Token = BaseToken & {
  erc1155Metadata: null | any;
}

export type ERC20Token = BaseToken & {
  tokenId: string;
}

export type Token = Erc721Token | Erc1155Token | ERC20Token;

export type TransactionMeta = {
  universalTokenId: number | "";
  tokenType: any;
  erc20TokenImage?: string;
  tokenInfo?: any;
  image?: string;
  tokenName?: string;
  blockTimestamp: string;
};

export type TransactionData = {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: null | number;
  asset: string;
  category: string;
  rawContract: {
    value: string | null;
    address: string;
    decimal: number | null;
  };
  token: Token;
  metadata?: TransactionMeta;
  blockNumDec: number;
  timestamp: number;
  datetime: string;
  direction: TransactionDirections;
};

/* 1) Type simplification: use reference types instead of redefining new types */
export type TxMetadataList = TransactionData['metadata'][];

/*
  Reducing shared inputs allows functions to work as individual units by reducing dependencies and coupling
*/
export const client = await connectClient();


/*
  Functions that manage side-effects, or procedural functions, should be logically seperated from imperatively "pure" functions.
  Such "pure" functions should have clearly defined inputs and outputs.

  Ex:
  Break dbFetchFilledKeysByWallet() in example1 into two functions:

  1) procedural: callFetchFilledKeysByWallet manages side-effects (do nothing and only log when error, memory cleanup for client no matter what)
  2) pure: fetchFilledKeysByWallet ONLY returns data of a specific type

*/
export async function callFetchFilledKeysByWallet(walletAddress: string): Promise<void> {
  try {
    await fetchFilledKeysByWallet(walletAddress);
  } catch (error) {
    console.error(`db:fetch (wallet: ${walletAddress}) :: dbFetchFilledKeysByWallet error: ${error}`);
  } finally {
    client.release();
  }
}

export async function fetchFilledKeysByWallet(walletAddress: string): Promise<SavedData> {
  const client = await connectClient();
  try {
    const walletId = await getDbWallet(client, walletAddress);

    // throw error if function execution cannot be completed
    if (!walletId) {
      throw new Error('No Wallet ID');
    }

    // Use const here and early return to improve control flow
    const [
      savedTransactions,
      savedAddressesDataSource1,
      savedAddressesDataSource2,
      savedAddressesDataSource3,
      savedAddressesDataSource4,
    ] = await Promise.all([
      getSavedTransactions(client, walletId),
      getAddressesStoredSource1(client, walletId),
      getAddressesStoredSource2(client, walletId),
      getAddressesStoredSource3(client, walletId),
      getAddressesStoredSource4(client, walletId),
    ])

    return {
      walletAddress,
      savedTransactions,
      savedAddressesDataSource1,
      savedAddressesDataSource2,
      savedAddressesDataSource3,
      savedAddressesDataSource4,
    };
  } catch (error) {
    throw new Error(`db:fetch (wallet: ${walletAddress}) :: dbFetchFilledKeysByWallet error: ${error}`);
  }
}
