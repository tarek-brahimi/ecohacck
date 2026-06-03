import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

type GlobalWithPool = typeof globalThis & {
  mysqlPool?: mysql.Pool;
};

function createPool() {
  if (process.env.MYSQL_URL) {
    return mysql.createPool(process.env.MYSQL_URL);
  }

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  if (!host || !user || !password || !database) {
    throw new Error('Missing MySQL environment variables. Set MYSQL_URL or MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE.');
  }

  return mysql.createPool({
    host,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    dateStrings: true,
  });
}

const globalForPool = globalThis as GlobalWithPool;

function getPool() {
  if (!globalForPool.mysqlPool) {
    globalForPool.mysqlPool = createPool();
  }

  return globalForPool.mysqlPool;
}

export async function query<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, values: unknown[] = []) {
  const [rows] = await getPool().query<T>(sql, values);
  return rows;
}

export async function execute(sql: string, values: unknown[] = []) {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values);
  return result;
}