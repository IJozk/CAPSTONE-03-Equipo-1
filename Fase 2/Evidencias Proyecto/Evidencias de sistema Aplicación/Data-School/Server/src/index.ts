import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.send('Data School Backend running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});