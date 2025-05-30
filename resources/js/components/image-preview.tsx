import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function ImagePreview({ urls }: { urls: string[] }) {
    const [index, setIndex] = useState(0);
    const url = urls[index];

    const previousPhoto = () => {
        setIndex((prev) => {
            if (prev === 0) return prev;
            return prev - 1;
        });
    };
    const nextPhoto = () => {
        setIndex((prev) => {
            if (prev === urls.length - 1) return prev;
            return prev + 1;
        });
    };

    return (
        <div className="relative flex h-full flex-col items-center p-3">
            {index !== 0 && (
                <button className="group absolute left-0 h-full cursor-pointer px-8" onClick={previousPhoto} title="Previous">
                    <ArrowLeft className="opacity-75 group-hover:opacity-100" />
                </button>
            )}
            <img className="h-full max-w-full" style={{ objectFit: 'contain' }} src={url} alt={`Uploaded image ${index + 1}`} />
            {index !== urls.length - 1 && (
                <button className="group absolute right-0 h-full cursor-pointer px-8" onClick={nextPhoto} title="Next">
                    <ArrowRight className="opacity-75 group-hover:opacity-100" />
                </button>
            )}
        </div>
        // </ReactCrop>
    );
}
