/* eslint-disable no-param-reassign */
import { getCustomRepository } from 'typeorm';
import { Router } from 'express';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';

import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const repository = getCustomRepository(TransactionsRepository);

  const transactionsResponse = {
    transactions: await repository.find(),
    balance: await repository.getBalance(),
  };

  transactionsResponse.transactions.map(t => {
    delete t.category_id;
    return t;
  });

  return response.json(transactionsResponse);
});

transactionsRouter.post('/', async (request, response) => {
  const createTransactionService = new CreateTransactionService();

  return response.json(await createTransactionService.execute(request.body));
});

transactionsRouter.delete('/:id', async (request, response) => {
  const service = new DeleteTransactionService();
  await service.execute(request.params.id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();

    const transiactions = await importTransactionsService.execute();

    return response.json(transiactions);
  },
);

export default transactionsRouter;
