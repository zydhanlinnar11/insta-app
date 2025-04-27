import ImagePreview from '@/components/image-preview';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { CircleUserRound, Heart, LoaderCircle, Send, TicketSlash, Trash } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
];

type PostImage = {
    link: string;
};

type Comment = {
    id: number;
    comment: string;
    commenter_username: string;
    created_at: string; // ISO 8601 date string
    can_delete: boolean;
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
    comments: Comment[];
};

export default function Home({ posts }: { posts: Post[] }) {
    // console.log(posts);
    const [mapLikedByPostId, setMapLikedByPostId] = useState<{ [key: number]: boolean }>({});
    const [mapLikesCountByPostId, setMapLikesCountByPostId] = useState<{ [key: number]: number }>({});
    const [isModalDeleteOpen, setModalDeleteOpen] = useState(false);
    const [modalDeletePostId, setModalDeletePostId] = useState(0);
    const [isDeleting, setDeleting] = useState(false);
    const [isModalDeleteCommentOpen, setModalDeleteCommentOpen] = useState(false);
    const [modalDeleteCommentId, setModalDeleteCommentId] = useState(0);

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

    const openDeleteCommentModal = (postId: number) => {
        setModalDeleteCommentOpen(true);
        setModalDeleteCommentId(postId);
    };

    const closeDeleteCommentModal = () => setModalDeleteCommentOpen(false);

    const deleteComment = async (commentId: number) => {
        try {
            setDeleting(true);
            await axios.delete(route('posts.deleteComment', { comment: commentId }));
            router.reload();
            closeDeleteCommentModal();
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
            <Dialog open={isModalDeleteCommentOpen} onOpenChange={setModalDeleteCommentOpen}>
                <DialogContent>
                    <DialogTitle>Are you sure you want to delete this comment?</DialogTitle>
                    <DialogDescription>Your comment will be permanently deleted.</DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={closeDeleteCommentModal} className="cursor-pointer">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            asChild
                            className="cursor-pointer"
                            onClick={() => deleteComment(modalDeleteCommentId)}
                        >
                            <button>Delete comment</button>
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
                                    <div className="py-3">
                                        <p>
                                            <b>{post.poster_username}</b> {post.caption}
                                        </p>
                                        <small className="opacity-80">{new Date(post.created_at).toLocaleString()}</small>
                                    </div>
                                    <p className="text-lg font-semibold">Comments</p>
                                    <div className="max-h-60 overflow-y-auto">
                                        {post.comments.length === 0 ? (
                                            <div className="flex items-center justify-center py-16">
                                                <div className="flex flex-col items-center gap-y-4">
                                                    <TicketSlash className="h-8 w-8" />
                                                    <p className="text-center font-medium">Currently, there are no comments available</p>
                                                </div>
                                            </div>
                                        ) : (
                                            post.comments.map((comment) => (
                                                <div className="flex justify-between py-3">
                                                    <div>
                                                        <p key={comment.id}>
                                                            <b>{comment.commenter_username}</b> {comment.comment}
                                                        </p>
                                                        <small className="opacity-80">{new Date(comment.created_at).toLocaleString()}</small>
                                                    </div>

                                                    {comment.can_delete && (
                                                        <Button
                                                            variant={'outline'}
                                                            className="w-fit cursor-pointer"
                                                            onClick={() => openDeleteCommentModal(comment.id)}
                                                            size={'sm'}
                                                        >
                                                            <Trash className="text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <CommentForm postId={post.id} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}

type CommentForm = {
    comment: string;
};

function CommentForm({ postId }: { postId: number }) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<CommentForm>>({
        comment: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('posts.addComment', { post: postId }), {
            onSuccess: () => reset('comment'),
        });
    };

    return (
        <form className="flex flex-col gap-2" onSubmit={submit}>
            <div className="flex gap-2">
                <Input
                    id="comment"
                    type="comment"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="comment"
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    placeholder="Write down your comment here..."
                />
                <Button type="submit" className="w-fit cursor-pointer" disabled={processing}>
                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
            <InputError message={errors.comment} />
        </form>
    );
}
