import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../db';

export interface User {
    _id?: ObjectId;
    whopUserId: string;      // Primary key (user_xxx format)
    username: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    accessLevel: 'admin' | 'customer' | 'no_access';
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
