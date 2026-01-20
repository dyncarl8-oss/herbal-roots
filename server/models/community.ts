import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from '../db';

export interface Reply {
    _id: string; // Generated on creation
    authorWhopId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: Date;
}

export interface CommunityPost {
    _id?: ObjectId;
    authorWhopId: string;
    authorName: string;
    authorAvatar?: string;
    authorRole: string;
    content: string;
    likes: string[]; // Array of whop user IDs who liked the post
    replies: Reply[];
    createdAt: Date;
    updatedAt: Date;
}

let postsCollection: Collection<CommunityPost> | null = null;

async function getPostsCollection(): Promise<Collection<CommunityPost>> {
    if (!postsCollection) {
        const db = await getDatabase();
        postsCollection = db.collection<CommunityPost>('community_posts');

        // Index for performance
        await postsCollection.createIndex({ createdAt: -1 });
    }
    return postsCollection;
}

export async function createPost(post: Omit<CommunityPost, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'replies'>): Promise<CommunityPost> {
    const collection = await getPostsCollection();
    const now = new Date();
    const newPost: CommunityPost = {
        ...post,
        likes: [],
        replies: [],
        createdAt: now,
        updatedAt: now
    };

    const result = await collection.insertOne(newPost);
    return { ...newPost, _id: result.insertedId };
}

export async function getAllPosts(): Promise<CommunityPost[]> {
    const collection = await getPostsCollection();
    return collection.find({}).sort({ createdAt: -1 }).toArray();
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
    const collection = await getPostsCollection();
    const post = await collection.findOne({ _id: new ObjectId(postId) });

    if (!post) throw new Error('Post not found');

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
        await collection.updateOne(
            { _id: new ObjectId(postId) },
            { $pull: { likes: userId }, $set: { updatedAt: new Date() } }
        );
        return false; // Result is unliked
    } else {
        await collection.updateOne(
            { _id: new ObjectId(postId) },
            { $push: { likes: userId }, $set: { updatedAt: new Date() } }
        );
        return true; // Result is liked
    }
}

export async function addReply(postId: string, reply: Omit<Reply, '_id' | 'createdAt'>): Promise<Reply> {
    const collection = await getPostsCollection();
    const now = new Date();
    const newReply: Reply = {
        _id: new ObjectId().toString(),
        ...reply,
        createdAt: now
    };

    await collection.updateOne(
        { _id: new ObjectId(postId) },
        {
            $push: { replies: newReply },
            $set: { updatedAt: now }
        }
    );

    return newReply;
}
