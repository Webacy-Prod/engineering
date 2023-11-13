import { client, savedAddresses, TxMetadataList } from "./example1.solution";

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

export const getSavedTransactions = (id: string):TxMetadataList => {
  const clientResult = client;
  if (clientResult && id) {
    return [];
  }

  return [];
}

export const getAddressesStoredSource1 = (id: string):savedAddresses[] => {
  //call client directly
  const clientResult = client;
  return [];
}

export const getAddressesStoredSource2 = (id: string):savedAddresses[] => {
  const clientResult = client;
  return [];
}

export const getAddressesStoredSource3 = (id: string):savedAddresses[] => {
  const clientResult = client;
  return [];
}

export const getAddressesStoredSource4 = (id: string):savedAddresses[] => {
  const clientResult = client;
  return [];
}