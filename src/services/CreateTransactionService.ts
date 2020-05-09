import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: RequestDTO): Promise<Transaction> {
    const repositoryTransaction = getCustomRepository(TransactionsRepository);
    const repositoryCategory = getRepository(Category);

    if (
      type === 'outcome' &&
      (await repositoryTransaction.getBalance()).total < value
    ) {
      throw new AppError('Outcome > Total!', 400);
    }

    const categoryExist = await repositoryCategory.findOne({
      where: { title: category },
    });

    let categoryId: string;

    if (categoryExist) {
      categoryId = categoryExist.id;
    } else {
      const categotyCreated = await repositoryCategory.create({
        title: category,
      });

      await repositoryCategory.save(categotyCreated);
      categoryId = categotyCreated.id;
    }

    const transaction: Transaction = repositoryTransaction.create({
      title,
      type,
      value,
      category_id: categoryId,
    });

    await repositoryTransaction.save(transaction);

    const transactionSaved = await repositoryTransaction.findOne(
      transaction.id,
    );
    delete transactionSaved?.category_id;

    return transactionSaved!;
  }
}

export default CreateTransactionService;
