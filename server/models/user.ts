import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../db';

// Basic structure for a saved blend/ritual
export interface SavedBlend {
    name: string;
    type: string;
    productId?: string; // ID for linking to ritual guide
    savedAt: string; // ISO date string
}

export interface User {
    _id?: ObjectId;
    whopUserId: string;      // Primary key (user_xxx format)
    username: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    accessLevel: 'admin' | 'customer' | 'no_access';
    savedBlends?: SavedBlend[];
    balance?: number;        // Current available commission
    totalEarned?: number;    // Lifetime commission earned
    createdAt: Date;
    updatedAt: Date;
}

export interface UpsertUserData {
    whopUserId: string;
    username: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    accessLevel?: 'admin' | 'customer' | 'no_access';
}

let usersCollection: Collection<User> | null = null;

async function getUsersCollection(): Promise<Collection<User>> {
    if (!usersCollection) {
        const db = await getDatabase();
        usersCollection = db.collection<User>('users');

        // Create index on whopUserId for fast lookups
        await usersCollection.createIndex({ whopUserId: 1 }, { unique: true });
    }
    return usersCollection;
}

export async function getUserByWhopId(whopUserId: string): Promise<User | null> {
    const collection = await getUsersCollection();
    return collection.findOne({ whopUserId });
}

export async function upsertUser(userData: UpsertUserData): Promise<User> {
    const collection = await getUsersCollection();
    const now = new Date();

    const result = await collection.findOneAndUpdate(
        { whopUserId: userData.whopUserId },
        {
            $set: {
                username: userData.username,
                name: userData.name,
                profilePicture: userData.profilePicture,
                bio: userData.bio,
                accessLevel: userData.accessLevel || 'customer',
                updatedAt: now,
            },
            $setOnInsert: {
                createdAt: now,
            },
        },
        {
            upsert: true,
            returnDocument: 'after'
        }
    );

    if (!result) {
        throw new Error('Failed to upsert user');
    }

    return result;
}

export async function getAllUsers(): Promise<User[]> {
    const collection = await getUsersCollection();
    return collection.find({}).toArray();
}

export async function updateUserAccessLevel(
    whopUserId: string,
    accessLevel: 'admin' | 'customer' | 'no_access'
): Promise<User | null> {
    const collection = await getUsersCollection();
    return collection.findOneAndUpdate(
        { whopUserId },
        { $set: { accessLevel, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
}

export async function addSavedBlend(whopUserId: string, blend: { name: string; type: string; productId?: string }): Promise<User | null> {
    const collection = await getUsersCollection();
    const savedBlend: SavedBlend = {
        ...blend,
        savedAt: new Date().toISOString()
    };

    return collection.findOneAndUpdate(
        { whopUserId },
        {
            $push: { savedBlends: { $each: [savedBlend], $position: 0 } } as any,
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
    );
}

export async function getUserSavedBlends(whopUserId: string): Promise<SavedBlend[]> {
    const user = await getUserByWhopId(whopUserId);
    return user?.savedBlends || [];
}

export async function updateUserBalance(whopUserId: string, amount: number): Promise<User | null> {
    const collection = await getUsersCollection();
    return collection.findOneAndUpdate(
        { whopUserId },
        {
            $inc: { balance: amount, totalEarned: amount },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
    );
}

export async function creditSystemAdmin(amount: number): Promise<User | null> {
    const collection = await getUsersCollection();
    const admin = await collection.findOne({ accessLevel: 'admin' });
    if (!admin) return null;

    return updateUserBalance(admin.whopUserId, amount);
}
