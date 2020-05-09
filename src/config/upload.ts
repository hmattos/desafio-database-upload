import multer from 'multer';
import path from 'path';

const pathTemp = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: pathTemp,
  storage: multer.diskStorage({
    destination: pathTemp,
    filename(request, file, callback) {
      const fileName = 'import_template.csv';

      return callback(null, fileName);
    },
  }),
};
