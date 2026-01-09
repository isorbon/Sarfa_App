import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { Point, Area } from 'react-easy-crop/types';

interface ImageCropperModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onCropComplete: (croppedImageBlob: Blob) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    imageSrc,
    onClose,
    onCropComplete
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                onCropComplete(croppedImage);
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className="cropper-modal-overlay">
            <div className="cropper-modal-content">
                <div className="cropper-header">
                    <h3>Crop Avatar</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="cropper-container">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div className="cropper-controls">
                    <div className="zoom-control">
                        <ZoomOut size={20} />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="zoom-slider"
                        />
                        <ZoomIn size={20} />
                    </div>

                    <button className="btn btn-primary" onClick={handleSave}>
                        <Check size={18} />
                        Save & Upload
                    </button>
                </div>
            </div>

            <style>{`
                .cropper-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }

                .cropper-modal-content {
                    background-color: var(--color-bg-secondary);
                    border-radius: var(--radius-xl);
                    width: 90%;
                    max-width: 500px;
                    overflow: hidden;
                    box-shadow: var(--shadow-2xl);
                    display: flex;
                    flex-direction: column;
                }

                .cropper-header {
                    padding: var(--space-4) var(--space-6);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--color-border);
                }

                .cropper-header h3 {
                    margin: 0;
                    font-size: var(--font-size-lg);
                    color: var(--color-text-primary);
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    padding: var(--space-1);
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn:hover {
                    background-color: var(--color-bg-tertiary);
                    color: var(--color-text-primary);
                }

                .cropper-container {
                    position: relative;
                    height: 300px;
                    width: 100%;
                    background-color: #333;
                }

                .cropper-controls {
                    padding: var(--space-6);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .zoom-control {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    color: var(--color-text-secondary);
                }

                .zoom-slider {
                    flex: 1;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default ImageCropperModal;
