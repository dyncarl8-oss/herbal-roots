import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../db';

export interface Transaction {
    _id?: ObjectId;
    type: 'ritual_purchase' | 'commission_credit';
    amount: number;         // Total sale amount
    commission: number;     // 50% for admins
    buyerWhopId: string;
    affiliateWhopId?: string; // Track who referred the sale
    description: string;
    createdAt: Date;
}

let transactionsCollection: Collection<Transaction> | null = null;

async function getTransactionsCollection(): Promise<Collection<Transaction>> {
    if (!transactionsCollection) {
        const db = await getDatabase();
        transactionsCollection = db.collection<Transaction>('transactions');
    }
    return transactionsCollection;
}

export async function createTransaction(data: Omit<Transaction, 'createdAt'>): Promise<Transaction> {
    const collection = await getTransactionsCollection();
    const transaction: Transaction = {
        ...data,
        createdAt: new Date()
    };

    await collection.insertOne(transaction);
    return transaction;
}

export async function getAdminStats() {
    const collection = await getTransactionsCollection();
    const transactions = await collection.find({}).toArray();

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);

    return {
        totalRevenue,
        totalCommission,
        transactionCount: transactions.length
    };
}

export async function getAllTransactions(): Promise<Transaction[]> {
    const collection = await getTransactionsCollection();
    return collection.find({}).sort({ createdAt: -1 }).toArray();
}
