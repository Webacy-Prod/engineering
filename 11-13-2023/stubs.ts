import { savedAddresses, TxMetadataList } from "./example1";

type Client = {
  clientName: string;
  release: (arg?: any) => void;
}

export const connectClient = ():Client => {
  return {
    clientName: 'abc',
    release: () => {},
  };
}

export const getDbWallet = (client: Client, wallet: string):string | null => {
  if (client && wallet) {
    return 'walletId1';
  }

  return null;
}

export const getSavedTransactions = (client: Client, id: string):TxMetadataList => {
  if (client && id) {
    return [];
  }

  return [];
}

export const getAddressesStoredSource1 = (client: Client, id: string):savedAddresses[] => {
  return [];
}

export const getAddressesStoredSource2 = (client: Client, id: string):savedAddresses[] => {
  return [];
}

export const getAddressesStoredSource3 = (client: Client, id: string):savedAddresses[] => {
  return [];
}

export const getAddressesStoredSource4 = (client: Client, id: string):savedAddresses[] => {
  return [];
}