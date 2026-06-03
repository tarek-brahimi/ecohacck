import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export type SqlValue = string | number | boolean | Date | Buffer | null;

export const MYSQL_DATABASE_NAME = 'hackathon_db';

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
  const database = process.env.MYSQL_DATABASE || MYSQL_DATABASE_NAME;

  if (!host || !user || !password) {
    throw new Error(
      'Missing MySQL environment variables. Set MYSQL_URL or MYSQL_HOST, MYSQL_USER, and MYSQL_PASSWORD.',
    );
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

export async function query<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, values: SqlValue[] = []) {
  const [rows] = await getPool().query<T>(sql, values);
  return rows;
}

export async function execute(sql: string, values: SqlValue[] = []) {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values);
  return result;
}