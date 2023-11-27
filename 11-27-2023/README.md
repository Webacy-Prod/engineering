# Testing and Mocking best practices

Quality assurance should primarily originate from the Software Development Team, as they can actively contribute to it by incorporating tests into the code. It should not be solely the responsibility of the Quality Assurance Team.

## Testing

### Unit testing and Integration testing

At Webacy we use a combination of unit testing and integration testing to ensure that our code is working as expected. Unit testing is the process of testing individual units of code to ensure that they are working as expected. Integration testing is the process of testing the integration of multiple units of code to ensure that they are working as expected.

### Code-First Testing" or "Test-Last Development" VS TDD

At Webacy we use a combination of "Code-First Testing" or "Test-Last Development" and TDD to ensure that our code is working as expected. "Code-First Testing" or "Test-Last Development" is the process of writing code first and then writing tests to ensure that the code is working as expected. TDD is the process of writing tests first and then writing code to ensure that the tests are working as expected.

TDD is a standard practice in the software industry. It is a process of writing tests first and then writing code to ensure that the tests are working as expected. On the other hand, it is important to note that "Code-First Testing" or "Test-Last Development" practice is not recommended in most cases, as TDD (Test-Driven Development) is a widely accepted methodology that typically leads to better code quality and early error detection. The "Code-First Testing" or "Test-Last Development" approach can result in quality issues and difficulties in the testing process.

### Webacy Test Tools

At webacy we use `Jest` as our testing framework. Jest is a JavaScript testing framework designed to ensure correctness of any JavaScript codebase. It allows you to write tests with an approachable, familiar and feature-rich API that gives you results quickly.

### Testing best practices

- Test only one thing per test if possible
- Each test should be atomic and independent from other tests
- Identify the different scenarios that your code can handle, take a look at the different paths that your code can take and test each one of them (EG. if statements, for loops, etc.)
- Use descriptive names for your tests
- Use `beforeEach` and `afterEach` to setup and teardown your tests
- Use `beforeAll` and `afterAll` to setup and teardown your tests
- Use `describe` to group your tests
- Use `expect` and  all the matchers to test your code (https://jestjs.io/docs/expect)
- Rely on `types` and `documentation` to mock your dependencies

> NOTE: Remember that tests are code, so be torough when writing them, making sure the tests are reflecting the expected behavior of the code, Otherwise you will end up with a lot of false positives and false negatives. In other words, you will end up with a lot of tests that are passing when they shouldn't and a lot of tests that are failing when they shouldn't.

### Testing example

This example shows how to test a simple function that returns the sum of two numbers.

```js
// file: sum.js
export const sum = (a, b) => a + b;
```

```js
// file: sum.test.js
import { sum } from './sum';

describe('sum', () => {
  it('should return the sum of two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

### Mocking

Mocking is a technique used in unit testing to isolate a component under test from its dependencies. The purpose of mocking is to allow the component under test to be tested in isolation from its dependencies.

Example:

```js
// file: user.js
import axios from 'axios';

export const getUser = async (id) => {
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
  return data;
};
```

```js
// file: user.test.js
import axios from 'axios';
import { getUser } from './user';

jest.mock('axios');

describe('getUser', () => {
  it('fetches successfully data from an API', async () => {
    const data = {
      data: {
        name: 'Leanne Graham',
      },
    };

    axios.get.mockImplementationOnce(() => Promise.resolve(data));
    await expect(getUser(1)).resolves.toEqual(data);
  });

  it('fetches erroneously data from an API', async () => {
    const errorMessage = 'Network Error';

    axios.get.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await expect(getUser(2)).rejects.toThrow(errorMessage);
  });
});
```

## Digging deeper into Webacy Testing and Mocking

In this section we will dig deeper into Webacy Testing and Mocking best practices. Without giving too much detail into the Mocking settings, if you want to learn more about the Mocking settings, please refer to the [Jest Mocking Documentation](https://jestjs.io/docs/mock-functions).

### Mocking best practices

- Mock only what you need
- Mock only what you can't control
- Mock only what you understand, When mocking make sure to have a good understanding of the code you are mocking, if you don't understand the code you are mocking, make sure the mock gets its functionality from types or documentation if possible(EG. At webacy we mock prisma client calls using the Prisma Client generated types, we mock contract calls using the contract ABI, etc.)
- [Mock/Spy exported functions within a single module in Jest](https://medium.com/@DavideRama/mock-spy-exported-functions-within-a-single-module-in-jest-cdf2b61af642)

### Mocking Prisma Client Calls
```js
// file: helpers/backups.ts
import prisma from '@/services/prisma';

export const fetchOffChainBackups = async (
  uid: string
): Promise<ApprovalWalletType[]> => {

  const user = await prisma.user.findUnique({
    where: {
      firestore_id: uid,
    },
  });

  const backupsData = await prisma.destination.findMany({
    where: {
      user_id: user?.id,
    },
  });

  return backupsData.map((bk) => ({
    address: bk.address as Address,
    name: bk.name || '',
    store: bk.store as StoreType,
    id: bk.id,
  }));
};
```

```js
// file: __tests__/helpers/backups.test.ts (webacy-dapp)


// Want to know how to mock prisma? Check out this file: https://github.com/Webacy-Prod/webacy-dapp/blob/b17137c8193ea1958938f53c41e51404c55af909/__mocks__/prisma.ts
import { prismaMock } from '@/__mocks__/prisma';
import { mockReset } from 'jest-mock-extended';
import {
  fetchOffChainBackups,
} from '@/helpers/backups';
import { StoreType } from '@/types/enums';

describe('backups helpers', () => {

  afterEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  describe('fetchOffChainBackups', () => {
    it('returns expected data', async () => {
      const destinations = [
        {
          address: '0x123',
          name: 'test',
          store: StoreType.OFF_CHAIN,
          id: '123',
          user_id: '123',
          type: 'backup',
          email: null,
          domain: null,
        },
        {
          address: '0x456',
          name: 'test2',
          store: StoreType.OFF_CHAIN,
          id: '456',
          user_id: '123',
          type: 'backup',
          email: null,
          domain: null,
        },
      ];
      prismaMock.destination.findMany.mockResolvedValueOnce(destinations);

      const offChainBackups = await fetchOffChainBackups('123');
      const expectedOffChainBackups: ApprovalWalletType[] = [
        {
          address: '0x123',
          name: 'test',
          store: StoreType.OFF_CHAIN,
          id: '123',
        },
        {
          address: '0x456',
          name: 'test2',
          store: StoreType.OFF_CHAIN,
          id: '456',
        },
      ];

      expect(offChainBackups).toEqual(expectedOffChainBackups);
    });
  });
});
```

### Mocking Smart Contracts Calls

```js
// file: helpers/backups.ts
export const fetchAllUserBackups = async (
  uid: string,
  protectionPlanAddress: Address | null
): Promise<{
  onChainBackups: Address[];
  offChainBackups: ApprovalWalletType[];
}> => {
  const offChainBackups = (await fetchOffChainBackups(uid)) || [];
  const offChainBackupAddresses = offChainBackups.map((bk) => bk.address);

  if (!protectionPlanAddress) {
    return { onChainBackups: [], offChainBackups };
  }

  try {
    const onChainBackups = await getRelatedWallets(
      protectionPlanAddress,
      offChainBackupAddresses
    );

    return { onChainBackups, offChainBackups };
  } catch (error) {
    console.log('error fetching related wallets', error);
    return { onChainBackups: [], offChainBackups };
  }
};
```

```js
// file: __tests__/helpers/backups.test.ts (webacy-dapp)

// Want to know how to mock prisma? Check out this file: https://github.com/Webacy-Prod/webacy-dapp/blob/b17137c8193ea1958938f53c41e51404c55af909/__mocks__/prisma.ts
import { prismaMock } from '@/__mocks__/prisma';
import { mockReset } from 'jest-mock-extended';
import {
  fetchAllUserBackups,
} from '@/helpers/backups';
import { StoreType } from '@/types/enums';

// Want to know how to mock contract calls? Check out this file: https://github.com/Webacy-Prod/webacy-dapp/blob/b17137c8193ea1958938f53c41e51404c55af909/__mocks__/protectionPlanContract.ts
import {
  getProtectionPlanContractMock,
  generateProtectionPlanContractMock,
} from '@/__mocks__/protectionPlanContract';
import { ethers } from 'ethers';

describe('backups helpers', () => {
  let protectionPlanContractMock;
  beforeAll(async () => {
    protectionPlanContractMock = await generateProtectionPlanContractMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  describe('fetchAllUserBackups', () => {
    it('returns expected data', async () => {
      const protectionPlanAddress = ethers.Wallet.createRandom().address;
      const destination1Address = ethers.Wallet.createRandom().address;
      const destination2Address = ethers.Wallet.createRandom().address;
      const destination3Address = ethers.Wallet.createRandom().address;
      const destinations = [
        {
          address: destination1Address,
          name: 'test',
          store: StoreType.ON_CHAIN,
          id: '123',
          user_id: '123',
          type: 'backup',
          email: null,
          domain: null,
        },
        {
          address: destination2Address,
          name: 'test2',
          store: StoreType.ON_CHAIN,
          id: '456',
          user_id: '123',
          type: 'backup',
          email: null,
          domain: null,
        },
        {
          address: destination3Address,
          name: 'test3',
          store: StoreType.OFF_CHAIN,
          id: '789',
          user_id: '123',
          type: 'backup',
          email: null,
          domain: null,
        },
      ];
      // Mock DB and contract calls
      prismaMock.destination.findMany.mockResolvedValueOnce(destinations);
      getProtectionPlanContractMock.mockResolvedValueOnce(
        protectionPlanContractMock
      );

      // All destinations are on chain, except destination3Address
      await protectionPlanContractMock.mock.relatedWallets
        .withArgs(destination1Address)
        .returns(true);
      await protectionPlanContractMock.mock.relatedWallets
        .withArgs(destination2Address)
        .returns(true);
      await protectionPlanContractMock.mock.relatedWallets
        .withArgs(destination3Address)
        .returns(false);

      const { onChainBackups, offChainBackups } = await fetchAllUserBackups(
        '123',
        protectionPlanAddress as Address
      );

      expect(getProtectionPlanContractMock).toHaveBeenCalledTimes(1);
      const expectedOnChainBackups = [destination1Address, destination2Address];
      const expectedOffChainBackups: ApprovalWalletType[] = [
        {
          address: destination1Address as Address,
          name: 'test',
          store: StoreType.ON_CHAIN,
          id: '123',
        },
        {
          address: destination2Address as Address,
          name: 'test2',
          store: StoreType.ON_CHAIN,
          id: '456',
        },
        {
          address: destination3Address as Address,
          name: 'test3',
          store: StoreType.OFF_CHAIN,
          id: '789',
        },
      ];

      expect(onChainBackups).toEqual(expectedOnChainBackups);
      expect(offChainBackups).toEqual(expectedOffChainBackups);
    });
  });
});

```

### Mocking Fetch Calls

```js
import { PRIVATE_ENVIRONMENT } from '@/environment';
import { alchemy } from '@/services/alchemy';
import { TokenStandard } from '@/types/enums';
import { getFirebaseAuthentication } from '@/utils/auth';
import { getErrorMessage } from '@/utils/errors';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    console.error(error);
    res.status(500).json({ error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

const getApprovalsRisk = async (req, res) => {
  try {
    await getFirebaseAuthentication(req);
  } catch (err) {
    return res.status(401).json({ error: getErrorMessage(err) });
  }

  const { walletAddress } = req.query;

  try {
    const response = await fetch(
      `${PRIVATE_ENVIRONMENT.RISK_SCORE_API_SERVER}/api/v1/risk-score/addresses/${walletAddress}/approvals`,
      {
        method: 'GET',
        headers: {
          'x-api-key': PRIVATE_ENVIRONMENT.RISK_SCORE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unable to get approvals from risk-score API`);
    }

    const data = (await response.json()) as GoplusApprovalData[];

    const getTokenAddress = (tokenData) => {
      if (tokenData.token_type === TokenStandard.ERC721) {
        return (tokenData as GoplusERC721TokenApprovalData).nft_address;
      }

      if (tokenData.token_type === TokenStandard.ERC1155) {
        return (tokenData as GoplusERC1155TokenApprovalData).nft_address;
      }

      return (tokenData as GoplusERC20TokenApprovalData).token_address;
    };

    const getTokenName = (tokenData) => {
      if (tokenData.token_type === TokenStandard.ERC721) {
        return (tokenData as GoplusERC721TokenApprovalData).nft_name;
      }

      if (tokenData.token_type === TokenStandard.ERC1155) {
        return (tokenData as GoplusERC1155TokenApprovalData).nft_name;
      }

      return (tokenData as GoplusERC20TokenApprovalData).token_name;
    };

    if (data.length > 0) {
      const assetMetadata = await alchemy.nft.getContractMetadataBatch(
        data.map((tokenData) => getTokenAddress(tokenData))
      );
      const approvals = data.map((tokenData) => {
        const foundAsset = assetMetadata.find(
          (contract) => contract.address === getTokenAddress(tokenData)
        );
        return {
          ...tokenData,
          asset: {
            ...foundAsset,
            name:
              foundAsset?.openSea?.collectionName || getTokenName(tokenData),
            logo: foundAsset?.openSea?.imageUrl,
          },
        };
      });

      return res.status(200).json(approvals);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: getErrorMessage(err) });
  }
};

apiRoute.get(getApprovalsRisk);

export default apiRoute;
```

```js
import approvalsHandler from '@/pages/api/risk/[walletAddress]/approvals';
import { getFirebaseAuthenticationMock } from '@/__mocks__/auth';
// Want to know how to mock NextJS API routes? Check out this file: https://github.com/Webacy-Prod/webacy-dapp/blob/b17137c8193ea1958938f53c41e51404c55af909/__tests__/query-client.ts
import { queryClient } from '@/__tests__/query-client';

describe('[GET] /api/risk/[walletAddress]/approvals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the expected response when risk score API returns expected data', async () => {
    const expectedResponse = {
      ERC1155: { code: 1, message: 'ok', result: [] },
      ERC20: { code: 1, message: 'ok', result: [] },
      ERC721: { code: 1, message: 'ok', result: [] },
    };

    getFirebaseAuthenticationMock.mockResolvedValueOnce(true);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ERC1155: { code: 1, message: 'ok', result: [] },
            ERC20: { code: 1, message: 'ok', result: [] },
            ERC721: { code: 1, message: 'ok', result: [] },
          }),
        ok: true,
      })
    ) as jest.Mock;

    const client = queryClient({
      handler: approvalsHandler,
      query: {
        walletAddress: '0x123456',
      },
    });

    const response = await client.get('/api/risk/0x123456/approvals');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });

  it('returns the expected response when risk score API returns an error', async () => {
    const expectedResponse = {
      error: 'Unable to get approvals from risk-score API',
    };

    getFirebaseAuthenticationMock.mockResolvedValueOnce(true);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: false,
        statusText: 'Internal Server Error',
      })
    ) as jest.Mock;

    const client = queryClient({
      handler: approvalsHandler,
      query: {
        walletAddress: '0x123',
      },
    });

    const response = await client.get('/api/risk/0x123/approvals');

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(expectedResponse);
  });
});

```

### Final thoughts

If you want to learn more about testing and mocking, please take a look at Webacy-dapp, IPFS-Approvals, IPFS-Contracts, and Risk-Score-API repositories.

## Next Steps

- [ ] Add React Testing Library best practices

## Optional

- [ ] Add BDD Testing best practices (Gherkin, Cucumber, etc.)
- [ ] Add Cypress/E2E best practices