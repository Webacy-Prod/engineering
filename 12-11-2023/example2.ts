import { getProvider1Auth, getProvider2Auth, getProvider3Auth } from "../11-13-2023/auth";
import { SavedData, TxMetadataList } from "../11-13-2023/example1";

type Data = {
  wallet_address: string;
  wallet_transfers: TxMetadataList[];
  addresses: string[];
}

enum DataProvider {
  One = "1",
  Two = "2",
  Three = "3",
}

const PROVIDER_1_ENABLED = true;
const PROVIDER_2_ENABLED = false;
const PROVIDER_3_ENABLED = true;

const storeData = (data: Data) => {
  // store data into db
  return true;
}

const getData = async (data: Data, skipData: SavedData, authOptions, provider: DataProvider):Promise<[string[], number, number]> => {
  const addresses = [];
  const total = 0;
  const skipped = 0;
  return [addresses, total, skipped]
}

export async function getAllData(data: Data): Promise<Data> {
  const walletAddress: string = data.wallet_address !== "" ? data.wallet_address : "n/a";
  const skipData:SavedData = {
    walletAddress,
    savedTransactions: [],
    savedAddressesDataSource1: [],
    savedAddressesDataSource2: [],
    savedAddressesDataSource3: [],
    savedAddressesDataSource4: [],
  }

  // get risk data for provider 1
  if (PROVIDER_1_ENABLED) {
    const data1Auth = await getProvider1Auth();
    const [addressesForProvider1] = await getData(data, skipData, data1Auth, DataProvider.One);
    data["addresses"] = addressesForProvider1;
  }

  // get risk data for provider 2
  if (PROVIDER_2_ENABLED) {
    const data2Auth = await getProvider2Auth();
    const [addressesForProvider2] = await getData(data, skipData, data2Auth, DataProvider.Two);
    data["addresses"] = addressesForProvider2;
  }

  // get risk data for provider 3
  if (PROVIDER_3_ENABLED) {
    const data3Auth = await getProvider3Auth();
    const [addressesForProvider3] = await getData(data, skipData, data3Auth, DataProvider.Three);
    data["addresses"] = addressesForProvider3;
  }

  // lazy save data into db for new addresses
  storeData(data);

  return data;
}

const runner = () => {
  const currentAddress = '0x9A006C4DE3B93989aa1d16EA78015cEc2eBef112';
  getAllData({
    wallet_address: currentAddress,
    wallet_transfers: [],
    addresses: [],
  })
}