import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TextArea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CircleAlert, Images, LoaderCircle } from 'lucide-react';
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

    const showImages = (files: File[]) => {
        setFiles(files);
        setDisplay('form');
    };

    const uploadImages = () => {
        try {
            setUploaded(true);
        } catch (e) {
        } finally {
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
            {display === 'picker' && <ImagePicker onSuccess={showImages} />}
            {display === 'form' && (
                <div className="flex flex-col xl:flex-row">
                    <div className="flex w-full flex-col items-center gap-y-8">
                        <ImagePreview files={files} />
                        {!isUploaded && (
                            <Button variant={'outline'} className="w-fit cursor-pointer" onClick={uploadImages}>
                                Next
                            </Button>
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
        </AppLayout>
    );
}

function ImagePreview({ files }: { files: File[] }) {
    const [index, setIndex] = useState(0);
    const file = files[index];
    const url = URL.createObjectURL(file);

    const previousPhoto = () => {
        setIndex((prev) => {
            if (prev === 0) return prev;
            return prev - 1;
        });
    };
    const nextPhoto = () => {
        setIndex((prev) => {
            if (prev === files.length - 1) return prev;
            return prev + 1;
        });
    };

    return (
        <div className="relative flex h-[calc(100vh-20rem)] flex-col items-center p-3">
            <button
                className="group absolute left-0 h-full cursor-pointer px-8 disabled:cursor-not-allowed"
                disabled={index === 0}
                onClick={previousPhoto}
                title="Previous"
            >
                <ArrowLeft className="opacity-75 group-hover:opacity-100 group-hover:group-disabled:opacity-75" />
            </button>
            <img className="h-full max-w-full" src={url} alt={`Uploaded image ${index + 1}`} />
            <button
                className="group absolute right-0 h-full cursor-pointer px-8 disabled:cursor-not-allowed"
                disabled={index === files.length - 1}
                onClick={nextPhoto}
                title="Next"
            >
                <ArrowRight className="opacity-75 group-hover:opacity-100 group-hover:group-disabled:opacity-75" />
            </button>
        </div>
        // </ReactCrop>
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
