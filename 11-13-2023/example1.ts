/*
  Example 1:
  - Type simplifcation
  - Use const instead of let
  - Using early returns for more readable control flow
*/

import { connectClient, getAddressesStoredSource1, getAddressesStoredSource2, getAddressesStoredSource3, getAddressesStoredSource4, getDbWallet, getSavedTransactions } from "./stubs";

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

export type TransactionData = {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: null | number;
  erc721TokenId: string;
  erc1155Metadata: null | any;
  tokenId: string;
  asset: string;
  category: string;
  rawContract: {
    value: string | null;
    address: string;
    decimal: number | null;
  };
  metadata: {
    blockTimestamp: string;
  };
  blockNumDec: number;
  timestamp: number;
  datetime: string;
  direction: TransactionDirections;
};

type TransactionMeta = {
  universalTokenId: number | "";
  tokenType: any;
  erc20TokenImage?: string;
  tokenInfo?: any;
  image?: string;
  tokenName?: string;
};

export type TxMetadata = TransactionData & TransactionMeta;
export type TxMetadataList = TxMetadata[];

export async function dbFetchFilledKeysByWallet(walletAddress: string): Promise<SavedData> {
  const client = await connectClient();

  let savedTransactions: TxMetadataList = [];
  let savedAddressesDataSource1: savedAddresses[] = [];
  let savedAddressesDataSource2: savedAddresses[] = [];
  let savedAddressesDataSource3: savedAddresses[] = [];
  let savedAddressesDataSource4: savedAddresses[] = [];
  try {
    const walletId = await getDbWallet(client, walletAddress);
    if (walletId) {
      savedTransactions = await getSavedTransactions(client, walletId);
      savedAddressesDataSource1 = await getAddressesStoredSource1(client, walletId);
      savedAddressesDataSource2 = await getAddressesStoredSource2(client, walletId);
      savedAddressesDataSource3 = await getAddressesStoredSource3(client, walletId);
      savedAddressesDataSource4 = await getAddressesStoredSource4(client, walletId);
    }
  } catch (error) {
    console.error(`db:fetch (wallet: ${walletAddress}) :: dbFetchFilledKeysByWallet error: ${error}`);
  } finally {
    client.release();
  }

  return {
    walletAddress,
    savedTransactions,
    savedAddressesDataSource1,
    savedAddressesDataSource2,
    savedAddressesDataSource3,
    savedAddressesDataSource4,
  };
}
