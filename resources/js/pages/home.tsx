import ImagePreview from '@/components/image-preview';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { CircleUserRound, Heart, TicketSlash } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
];

type PostImage = {
    link: string;
};

type Post = {
    id: number;
    caption: string;
    poster_username: string;
    created_at: string; // ISO 8601 date string
    images: PostImage[];
    likes_count: number;
    is_liked: boolean;
};

export default function Home({ posts }: { posts: Post[] }) {
    const [mapLikedByPostId, setMapLikedByPostId] = useState<{ [key: number]: boolean }>({});
    const [mapLikesCountByPostId, setMapLikesCountByPostId] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        posts.forEach(({ id, is_liked, likes_count }) => {
            setMapLikedByPostId((prev) => ({
                ...prev,
                [id]: is_liked,
            }));
            setMapLikesCountByPostId((prev) => ({
                ...prev,
                [id]: likes_count,
            }));
        });
    }, [posts]);

    const handleLikeButton = async (postId: number) => {
        try {
            const isLiked = mapLikedByPostId[postId];
            await axios.post(route('posts.toggleLike', { post: postId }));
            setMapLikedByPostId((prev) => ({
                ...prev,
                [postId]: !prev[postId],
            }));
            setMapLikesCountByPostId((prev) => ({
                ...prev,
                [postId]: prev[postId] + (isLiked ? -1 : 1),
            }));
        } catch (e) {}
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            {posts.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center gap-y-4">
                        <TicketSlash className="h-24 w-24" />
                        <p className="text-center text-2xl font-medium">Currently, there are no posts available</p>
                    </div>
                </div>
            ) : (
                <div className="mx-auto flex w-full max-w-[48rem] flex-col p-4 sm:p-8">
                    {posts.map((post, idx) => {
                        const isLiked = mapLikedByPostId[post.id];
                        const likesCount = mapLikesCountByPostId[post.id];

                        return (
                            <div key={post.id} className={cn(idx === posts.length - 1 ? null : 'border-b', 'pb-3')}>
                                <div className="flex gap-x-3 p-4">
                                    <CircleUserRound />
                                    <span>{post.poster_username}</span>
                                </div>
                                <div className="h-72 xl:h-96">
                                    <ImagePreview urls={post.images.map(({ link }) => link)} />
                                </div>
                                <div className="p-4">
                                    <div className="flex gap-x-3 py-2">
                                        <button className="hover:cursor-pointer hover:opacity-80" onClick={() => handleLikeButton(post.id)}>
                                            <Heart fill={isLiked ? '#fb2c36' : undefined} className={isLiked ? 'text-red-500' : undefined} />
                                        </button>
                                        {/* <button className="hover:cursor-pointer hover:opacity-80">
                                            <MessageSquare />
                                        </button> */}
                                    </div>
                                    <p className="font-bold">
                                        {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                                    </p>
                                    <p>
                                        <b>{post.poster_username}</b> {post.caption}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
