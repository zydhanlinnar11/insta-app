import ImagePreview from '@/components/image-preview';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { CircleUserRound, Heart, TicketSlash, Trash } from 'lucide-react';
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
    can_delete: boolean;
};

export default function Home({ posts }: { posts: Post[] }) {
    const [mapLikedByPostId, setMapLikedByPostId] = useState<{ [key: number]: boolean }>({});
    const [mapLikesCountByPostId, setMapLikesCountByPostId] = useState<{ [key: number]: number }>({});
    const [isModalDeleteOpen, setModalDeleteOpen] = useState(false);
    const [modalDeletePostId, setModalDeletePostId] = useState(0);
    const [isDeleting, setDeleting] = useState(false);

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

    const openDeleteModal = (postId: number) => {
        setModalDeleteOpen(true);
        setModalDeletePostId(postId);
    };

    const closeDeleteModal = () => setModalDeleteOpen(false);

    const deletePost = async (postId: number) => {
        try {
            setDeleting(true);
            await axios.delete(route('posts.destroy', { post: postId }));
            router.reload();
            closeDeleteModal();
        } catch (e) {
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />
            <Dialog open={isModalDeleteOpen} onOpenChange={setModalDeleteOpen}>
                <DialogContent>
                    <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
                    <DialogDescription>Once your post is deleted, all of its likes and comments will also be permanently deleted.</DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={closeDeleteModal} className="cursor-pointer">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            asChild
                            className="cursor-pointer"
                            onClick={() => deletePost(modalDeletePostId)}
                        >
                            <button>Delete post</button>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex gap-x-3">
                                        <CircleUserRound />
                                        <span>{post.poster_username}</span>
                                    </div>

                                    {post.can_delete && (
                                        <Button variant={'outline'} className="w-fit cursor-pointer" onClick={() => openDeleteModal(post.id)}>
                                            <Trash className="text-red-500" />
                                        </Button>
                                    )}
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
