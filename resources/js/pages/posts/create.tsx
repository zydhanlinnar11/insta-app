import ImagePreview from '@/components/image-preview';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { CircleAlert, Images, LoaderCircle } from 'lucide-react';
import { ChangeEventHandler, DragEventHandler, FormEventHandler, MouseEventHandler, useRef, useState } from 'react';

const allowedFileTypes = ['jpg', 'jpeg', 'png'];
const maxFileSizeBytes = 2 * 1024 * 1024; // 2 MB

type CreatePostForm = {
    caption: string;
    image_ids: number[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create',
        href: '/posts/create',
    },
];

export default function CreatePost() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<CreatePostForm>>({
        caption: '',
        image_ids: [],
    });

    const [files, setFiles] = useState<File[]>([]);
    const [display, setDisplay] = useState<'picker' | 'form'>('picker');
    const [isUploaded, setUploaded] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setUploading] = useState(false);

    const showImages = (files: File[]) => {
        setFiles(files);
        setDisplay('form');
    };

    const uploadImages = async () => {
        setUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);

                const res = await axios.postForm(route('images.upload'), formData);
                const { id: imageId }: { id: number } = res.data;

                setData((prev) => ({
                    ...prev,
                    image_ids: [...prev.image_ids, imageId],
                }));
            }
            setUploaded(true);
        } catch (e) {
            setUploadError('Unable to upload images, please try again later.');
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('posts.store'), {
            onFinish: () => reset('caption'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />
            <div className="relative h-full">
                <div
                    className={cn(
                        'absolute flex h-full w-full items-center justify-center transition-colors',
                        isUploading ? 'z-10 bg-black/60' : '-z-10',
                    )}
                >
                    <LoaderCircle className="h-12 w-12 animate-spin" />
                </div>
                {display === 'picker' && <ImagePicker onSuccess={showImages} />}
                {display === 'form' && (
                    <div className="flex flex-col xl:flex-row">
                        <div className="flex w-full flex-col items-center gap-y-8">
                            <div className="h-[calc(100vh-15rem)] w-full">
                                <ImagePreview urls={files.map((file) => URL.createObjectURL(file))} />
                            </div>
                            {!isUploaded && (
                                <>
                                    {uploadError && <p>{uploadError}</p>}
                                    <Button variant={'outline'} className="w-fit cursor-pointer" onClick={uploadImages}>
                                        Next
                                    </Button>
                                </>
                            )}
                        </div>
                        {isUploaded && (
                            <div className="xl:w-4/12">
                                <form className="flex flex-col gap-6 p-4" onSubmit={submit}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="caption">Caption</Label>
                                        <TextArea
                                            id="caption"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="caption"
                                            value={data.caption}
                                            onChange={(e) => setData('caption', e.target.value)}
                                            placeholder="Write your caption here..."
                                            rows={8}
                                        />
                                        <InputError message={errors.caption} />
                                    </div>

                                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Create
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function ImagePicker({ onSuccess }: { onSuccess: (files: File[]) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState('');

    const handleFileList = (fileList: FileList | null) => {
        if (!fileList) {
            return;
        }

        const files: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fileExtension = file.name.split('.').pop() ?? '';
            const isFileTypeAllowed = allowedFileTypes.find((allowedFileType) => allowedFileType === fileExtension);

            if (!isFileTypeAllowed) {
                setError(`File type is not supported. Allowed file types are: ${allowedFileTypes.join(', ')}`);
                return;
            }

            if (file.size > maxFileSizeBytes) {
                setError('Image is too large, maximum file size is 2 MB');
                return;
            }

            files.push(file);
        }

        onSuccess(files);
    };

    const dropHandler: DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        handleFileList(e.dataTransfer.files);
    };

    const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        handleFileList(e.target.files);
    };

    const clickHandler: MouseEventHandler<HTMLButtonElement> = (e) => {
        inputRef.current?.click();
    };

    return (
        <div
            className="flex h-full items-center justify-center"
            onDrop={dropHandler}
            onDragOver={(e) => {
                e.preventDefault();
            }}
        >
            <div className="flex flex-col items-center gap-y-3">
                <input
                    type={'file'}
                    accept={allowedFileTypes.map((allowedFileType) => `.${allowedFileType}`).join(',')}
                    ref={inputRef}
                    onChange={onInputChange}
                    hidden
                />

                {error ? <CircleAlert className="h-24 w-24" /> : <Images className="h-24 w-24" />}
                <p className="text-center text-2xl font-medium">{error || 'Drag photos here'}</p>
                {error && <p className="text-center opacity-80">Please choose another file</p>}
                <Button className="mt-3 cursor-pointer" variant={'outline'} onClick={clickHandler}>
                    Select from computer
                </Button>
            </div>
        </div>
    );
}
