import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const listTransactions = await getRepository(Transaction).find();

    const { sumIncome, sumOutcome } = listTransactions.reduce(
      (accumulator, transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.sumIncome += transaction.value;
            break;
          case 'outcome':
            accumulator.sumOutcome += transaction.value;
            break;
          default:
            break;
        }
        return accumulator;
      },
      {
        sumIncome: 0,
        sumOutcome: 0,
      },
    );

    const balance: Balance = {
      income: sumIncome,
      outcome: sumOutcome,
      total: sumIncome - sumOutcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
