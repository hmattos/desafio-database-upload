import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionsFile {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp');

    const data: TransactionsFile[] = await this.loadCSV(
      `${csvFilePath}/import_template.csv`,
    );

    const createService = new CreateTransactionService();

    const transactionsCreated: Transaction[] = [];

    const promisses = data.map(async transaction => {
      if (transaction.type === 'income') {
        const tCreated = await createService.execute(transaction);
        transactionsCreated.push(tCreated);
      }
    });

    await Promise.all(promisses);

    const promisses2 = data.map(async transaction => {
      if (transaction.type === 'outcome') {
        const tCreated = await createService.execute(transaction);
        transactionsCreated.push(tCreated);
      }
    });

    await fs.promises.unlink(path.join(csvFilePath, 'import_template.csv'));

    await Promise.all(promisses2);

    return transactionsCreated;
  }

  async loadCSV(filePath: string): Promise<TransactionsFile[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionsFile[] = [];

    parseCSV.on('data', line => {
      lines.push({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
