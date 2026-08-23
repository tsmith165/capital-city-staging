'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Pencil, Trash2, Upload, Images, Check, ImageIcon, Loader2, MoveLeft, MoveRight } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import ProjectResizeUploader from '@/components/ProjectResizeUploader';

// ─── Types ──────────────────────────────────────────────────────────────────

type HomepageImageDoc = Doc<'homepageImages'>;

interface ProjectWithImages {
    projectId: Id<'projects'>;
    projectName: string;
    images: Array<
        Doc<'projectImages'> & {
            alreadyOnHomepage: boolean;
        }
    >;
}

// ─── Live Preview Strip ─────────────────────────────────────────────────────

function LivePreviewStrip({ images }: { images: HomepageImageDoc[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        if (images.length === 0 || isPaused) return;

        const interval = setInterval(async () => {
            setIsVisible(false);
            await new Promise((r) => setTimeout(r, 1200));
            indexRef.current = (indexRef.current + 1) % images.length;
            setCurrentIndex(indexRef.current);
            setIsVisible(true);
        }, 4500);

        return () => clearInterval(interval);
    }, [images.length, isPaused]);

    useEffect(() => {
        if (indexRef.current >= images.length) {
            indexRef.current = 0;
            setCurrentIndex(0);
        }
    }, [images.length]);

    if (images.length === 0) {
        return (
            <div className="border-line bg-surface-raised/50 mx-auto mt-4 flex aspect-[16/9] max-h-[350px] w-full max-w-3xl items-center justify-center overflow-hidden rounded-xl border">
                <p className="text-body-subtle text-sm">No active images to preview</p>
            </div>
        );
    }

    return (
        <div
            className="border-line relative mx-auto mt-4 aspect-[16/9] max-h-[350px] w-full max-w-3xl overflow-hidden rounded-xl border"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence>
                {isVisible && images[currentIndex] && (
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={images[currentIndex].imagePath}
                            width={images[currentIndex].width}
                            height={images[currentIndex].height}
                            className="h-full w-full object-cover"
                            alt="Homepage preview"
                            sizes="100vw"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/50 via-transparent to-stone-900/50" />

            <div className="absolute bottom-3 left-4">
                <span className="bg-surface/70 text-primary rounded-full px-3 py-1 text-xs font-medium">Live Preview</span>
            </div>

            <div className="absolute right-4 bottom-3 flex gap-1.5">
                {images.map((_: HomepageImageDoc, i: number) => (
                    <div
                        key={i}
                        className={`h-2 w-2 rounded-full transition-colors ${i === currentIndex ? 'bg-gold-400' : 'bg-stone-500'}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Homepage Image Card ────────────────────────────────────────────────────

function HomepageImageCard({
    image,
    position,
    total,
    onToggleActive,
    onRemove,
    onEditCaption,
    onMove,
    onDragStart,
    onDragOver,
    onDrop,
    isDragTarget,
}: {
    image: HomepageImageDoc;
    position: number;
    total: number;
    onToggleActive: () => void;
    onRemove: () => void;
    onEditCaption: () => void;
    /** Ordering has to be reachable without a mouse; drag alone excluded keyboard users entirely. */
    onMove: (direction: -1 | 1) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    isDragTarget: boolean;
}) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`group bg-surface-raised relative cursor-grab overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl active:cursor-grabbing ${
                !image.active ? 'opacity-50 grayscale' : ''
            } ${isDragTarget ? 'ring-gold-300 ring-2 ring-offset-2 ring-offset-stone-900' : ''}`}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                    src={image.thumbnailPath || image.imagePath}
                    width={image.thumbnailWidth || image.width}
                    height={image.thumbnailHeight || image.height}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={image.title || 'Homepage image'}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Position badge */}
                <div className="bg-gold-400 text-body-inverse absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md">
                    {position}
                </div>

                {/* Active/Inactive badge */}
                <div
                    className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        image.active ? 'bg-success-soft text-success' : 'bg-surface-hover/90 text-body-muted'
                    }`}
                >
                    {image.active ? 'Active' : 'Inactive'}
                </div>

                {/* Hover overlay with actions */}
                <div className="bg-surface/60 absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMove(-1);
                        }}
                        disabled={position === 1}
                        aria-label={`Move image ${position} earlier`}
                        className="bg-surface-raised/90 text-body-muted hover:bg-surface-hover hover:text-body flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                    >
                        <MoveLeft size={18} aria-hidden="true" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive();
                        }}
                        className="bg-surface-raised/90 text-body-muted hover:bg-surface-hover hover:text-body flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                        aria-label={image.active ? `Hide image ${position} from the homepage` : `Show image ${position} on the homepage`}
                        data-tooltip-id="homepage-tooltip"
                        data-tooltip-content={image.active ? 'Set Inactive' : 'Set Active'}
                    >
                        {image.active ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditCaption();
                        }}
                        className="bg-surface-raised/90 text-body-muted hover:bg-gold-400 hover:text-body-inverse flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                        aria-label={`Edit the caption for image ${position}`}
                        data-tooltip-id="homepage-tooltip"
                        data-tooltip-content="Edit caption"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="bg-surface-raised/90 text-body-muted hover:bg-danger-soft hover:text-danger flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                        aria-label={`Remove image ${position} from the homepage`}
                        data-tooltip-id="homepage-tooltip"
                        data-tooltip-content="Remove from homepage"
                    >
                        <Trash2 size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMove(1);
                        }}
                        disabled={position === total}
                        aria-label={`Move image ${position} later`}
                        className="bg-surface-raised/90 text-body-muted hover:bg-surface-hover hover:text-body flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                    >
                        <MoveRight size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Caption */}
            <div className="px-3 py-2">
                <p className="text-body-subtle truncate text-sm">{image.title || 'No caption'}</p>
                {image.sourceType === 'project' && <p className="text-body-subtle mt-0.5 truncate text-xs">From project</p>}
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function HomepageManageClient() {
    // Convex queries
    const homepageImages = useQuery(api.homepageImages.getAllHomepageImages);
    const availableProjects = useQuery(api.homepageImages.getAvailableProjectImages);

    // Convex mutations
    const addHomepageImage = useMutation(api.homepageImages.addHomepageImage);
    const addProjectImagesToHomepage = useMutation(api.homepageImages.addProjectImagesToHomepage);
    const removeHomepageImage = useMutation(api.homepageImages.removeHomepageImage);
    const toggleActive = useMutation(api.homepageImages.toggleHomepageImageActive);
    const updateHomepageImage = useMutation(api.homepageImages.updateHomepageImage);
    const reorderHomepageImages = useMutation(api.homepageImages.reorderHomepageImages);

    // UI state
    const [addTab, setAddTab] = useState<'projects' | 'upload'>('projects');
    const [selectedProject, setSelectedProject] = useState(0);
    const [selectedProjectImages, setSelectedProjectImages] = useState<Set<string>>(new Set());
    const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
    const [captionInput, setCaptionInput] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadCaption, setUploadCaption] = useState('');
    const [pendingUpload, setPendingUpload] = useState<{
        originalImageUrl: string;
        smallImageUrl: string;
        originalWidth: number;
        originalHeight: number;
        smallWidth: number;
        smallHeight: number;
    } | null>(null);

    // Active images for preview
    const activeImages = useMemo(() => {
        if (!homepageImages) return [];
        return homepageImages.filter((img: HomepageImageDoc) => img.active);
    }, [homepageImages]);

    // ─── Caption Editing ────────────────────────────────────────────────

    const startEditCaption = (image: HomepageImageDoc) => {
        setEditingCaptionId(image._id);
        setCaptionInput(image.title || '');
    };

    const runOrFail = async (action: Promise<unknown>, message: string) => {
        setError(null);
        try {
            await action;
            return true;
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : message);
            return false;
        }
    };

    const saveCaption = async () => {
        if (!editingCaptionId) return;
        const ok = await runOrFail(
            updateHomepageImage({ id: editingCaptionId as Id<'homepageImages'>, title: captionInput }),
            'Could not save that caption.',
        );
        if (!ok) return;
        setEditingCaptionId(null);
        setCaptionInput('');
    };

    // ─── Drag and Drop ─────────────────────────────────────────────────

    const handleDragStart = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const commitOrder = async (from: number, to: number) => {
        if (!homepageImages || from === to || to < 0 || to >= homepageImages.length) return;

        const newOrder = [...homepageImages];
        const [moved] = newOrder.splice(from, 1);
        newOrder.splice(to, 0, moved);

        await runOrFail(
            reorderHomepageImages({ imageIds: newOrder.map((img: HomepageImageDoc) => img._id) }),
            'Could not save that order.',
        );
    };

    const handleDrop = (dropIndex: number) => async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        await commitOrder(draggedIndex, dropIndex);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // ─── Remove Image ──────────────────────────────────────────────────

    const handleRemove = async (id: Id<'homepageImages'>) => {
        if (!window.confirm('Remove this image from the homepage slideshow?')) return;
        await runOrFail(removeHomepageImage({ id }), 'Could not remove that image.');
    };

    // ─── Add From Projects ─────────────────────────────────────────────

    const toggleProjectImageSelection = (imageId: string) => {
        setSelectedProjectImages((prev) => {
            const next = new Set(prev);
            if (next.has(imageId)) {
                next.delete(imageId);
            } else {
                next.add(imageId);
            }
            return next;
        });
    };

    const handleSelectAllFromProject = () => {
        if (!availableProjects || availableProjects.length === 0) return;
        const project = availableProjects[selectedProject] as ProjectWithImages | undefined;
        if (!project) return;

        const selectableIds = project.images.filter((img) => !img.alreadyOnHomepage).map((img) => img._id.toString());

        const allSelected = selectableIds.every((id: string) => selectedProjectImages.has(id));

        if (allSelected) {
            setSelectedProjectImages((prev) => {
                const next = new Set(prev);
                selectableIds.forEach((id: string) => next.delete(id));
                return next;
            });
        } else {
            setSelectedProjectImages((prev) => {
                const next = new Set(prev);
                selectableIds.forEach((id: string) => next.add(id));
                return next;
            });
        }
    };

    const handleAddSelectedToHomepage = async () => {
        if (selectedProjectImages.size === 0) return;
        setIsAdding(true);
        try {
            await addProjectImagesToHomepage({
                projectImageIds: Array.from(selectedProjectImages) as Id<'projectImages'>[],
            });
            setSelectedProjectImages(new Set());
        } finally {
            setIsAdding(false);
        }
    };

    // ─── Upload ────────────────────────────────────────────────────────

    const handleUploadComplete = (
        images: Array<{
            fileName: string;
            originalImageUrl: string;
            smallImageUrl: string;
            originalWidth: number;
            originalHeight: number;
            smallWidth: number;
            smallHeight: number;
        }>,
    ) => {
        if (images.length > 0) {
            setPendingUpload(images[0]);
        }
    };

    const handleAddUploadedImage = async () => {
        if (!pendingUpload) return;
        setIsAdding(true);
        try {
            await addHomepageImage({
                imagePath: pendingUpload.originalImageUrl,
                width: pendingUpload.originalWidth,
                height: pendingUpload.originalHeight,
                thumbnailPath: pendingUpload.smallImageUrl,
                thumbnailWidth: pendingUpload.smallWidth,
                thumbnailHeight: pendingUpload.smallHeight,
                title: uploadCaption || undefined,
                sourceType: 'upload',
            });
            setPendingUpload(null);
            setUploadCaption('');
        } finally {
            setIsAdding(false);
        }
    };

    // ─── Loading State ─────────────────────────────────────────────────

    if (homepageImages === undefined) {
        return (
            <div className="bg-surface flex h-full items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
        );
    }

    const currentProject = availableProjects?.[selectedProject] as ProjectWithImages | undefined;

    return (
        <div className="bg-surface flex h-full w-full flex-col" onDragEnd={handleDragEnd}>
            {/* Live Preview Strip */}
            <LivePreviewStrip images={activeImages} />

            {/* Scrollable content */}
            <div className="flex-grow overflow-y-auto px-4 pb-8">
                {/* ─── Current Homepage Images ──────────────────────────────── */}
                <div className="mt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-body text-xl font-semibold">
                            Homepage Slideshow
                            <span className="text-body-subtle ml-2 text-sm font-normal">
                                ({activeImages.length} active of {homepageImages.length} total)
                            </span>
                        </h2>
                        <p className="text-body-subtle text-xs">Drag to reorder</p>
                    </div>

                    {homepageImages.length === 0 ? (
                        /* Empty State */
                        <div className="border-line flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
                            <ImageIcon size={64} className="mb-4 text-stone-600" />
                            <h3 className="text-body-muted text-xl font-semibold">No Homepage Images Yet</h3>
                            <p className="text-body-subtle mt-2 max-w-md">Add project photos or upload an image.</p>
                            <button
                                onClick={() => setAddTab('projects')}
                                className="bg-gold-400 text-body-inverse hover:bg-gold-300 mt-6 rounded-lg px-6 py-2.5 font-medium transition-colors"
                            >
                                Browse Project Images
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {homepageImages.map((image: HomepageImageDoc, index: number) => (
                                <HomepageImageCard
                                    key={image._id}
                                    image={image}
                                    position={index + 1}
                                    total={homepageImages.length}
                                    onToggleActive={() => void runOrFail(toggleActive({ id: image._id }), 'Could not change that image.')}
                                    onRemove={() => handleRemove(image._id)}
                                    onEditCaption={() => startEditCaption(image)}
                                    onMove={(direction) => void commitOrder(index, index + direction)}
                                    onDragStart={handleDragStart(index)}
                                    onDragOver={handleDragOver(index)}
                                    onDrop={handleDrop(index)}
                                    isDragTarget={dragOverIndex === index && draggedIndex !== index}
                                />
                            ))}
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="border-danger/40 bg-danger-soft text-danger mt-4 rounded-lg border px-4 py-2.5 text-sm">
                            {error}
                        </p>
                    )}

                    {/* Warning when all images are inactive */}
                    {homepageImages.length > 0 && activeImages.length === 0 && (
                        <div className="border-warning/40 bg-warning-soft text-warning mt-4 rounded-lg border p-3 text-sm">
                            All images are inactive. The homepage will display default fallback images.
                        </div>
                    )}
                </div>

                {/* ─── Caption Edit Modal ───────────────────────────────────── */}
                {editingCaptionId && (
                    <div
                        className="bg-surface/80 fixed inset-0 z-50 flex items-center justify-center"
                        onClick={() => setEditingCaptionId(null)}
                    >
                        <div onClick={(e) => e.stopPropagation()} className="bg-surface-raised w-full max-w-md rounded-xl p-6 shadow-2xl">
                            <h3 className="text-body mb-4 text-lg font-semibold">Edit Caption</h3>
                            <input
                                type="text"
                                value={captionInput}
                                onChange={(e) => setCaptionInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveCaption()}
                                className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded-lg border px-4 py-2.5 focus:outline-none"
                                placeholder="Enter a caption..."
                                autoFocus
                            />
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingCaptionId(null)}
                                    className="text-body-subtle hover:text-body rounded-lg px-4 py-2 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveCaption}
                                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Divider ──────────────────────────────────────────────── */}
                <div className="border-line my-8 border-t" />

                {/* ─── Add Images Section ───────────────────────────────────── */}
                <div>
                    <h2 className="text-body mb-4 text-xl font-semibold">Add Images</h2>

                    {/* Tab Navigation */}
                    <div className="bg-surface-raised mb-6 flex gap-1 rounded-lg p-1">
                        <button
                            onClick={() => setAddTab('projects')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                addTab === 'projects' ? 'bg-gold-400 text-body-inverse' : 'text-body-subtle hover:text-body'
                            }`}
                        >
                            <Images size={16} />
                            From Projects
                        </button>
                        <button
                            onClick={() => setAddTab('upload')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                addTab === 'upload' ? 'bg-gold-400 text-body-inverse' : 'text-body-subtle hover:text-body'
                            }`}
                        >
                            <Upload size={16} />
                            Upload New
                        </button>
                    </div>

                    {/* ─── Tab: From Projects ──────────────────────────────── */}
                    {addTab === 'projects' && (
                        <div>
                            {!availableProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="text-body-subtle h-6 w-6 animate-spin" />
                                </div>
                            ) : availableProjects.length === 0 ? (
                                <div className="text-body-subtle py-12 text-center">No highlighted projects.</div>
                            ) : (
                                <>
                                    {/* Project selector pills */}
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {availableProjects.map((project: ProjectWithImages, index: number) => (
                                            <button
                                                key={project.projectId}
                                                onClick={() => {
                                                    setSelectedProject(index);
                                                    setSelectedProjectImages(new Set());
                                                }}
                                                className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-all ${
                                                    index === selectedProject
                                                        ? 'border-gold-300 bg-gold-400/10 text-body'
                                                        : 'border-line-strong text-body-subtle hover:border-primary hover:text-primary bg-transparent'
                                                }`}
                                            >
                                                {project.projectName}
                                                <span className="ml-1.5 text-xs opacity-70">({project.images.length})</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Batch action bar */}
                                    {currentProject && currentProject.images.length > 0 && (
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-body-subtle text-sm">
                                                {selectedProjectImages.size > 0 ? `${selectedProjectImages.size} selected` : ''}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSelectAllFromProject}
                                                    className="bg-surface-overlay text-body-muted hover:bg-surface-hover rounded px-3 py-1.5 text-xs transition-colors"
                                                >
                                                    {currentProject.images.filter((img) => !img.alreadyOnHomepage).length ===
                                                        selectedProjectImages.size && selectedProjectImages.size > 0
                                                        ? 'Deselect All'
                                                        : 'Select All'}
                                                </button>
                                                <button
                                                    onClick={handleAddSelectedToHomepage}
                                                    disabled={selectedProjectImages.size === 0 || isAdding}
                                                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 rounded px-4 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isAdding ? (
                                                        <Loader2 size={14} className="inline animate-spin" />
                                                    ) : (
                                                        `Add ${selectedProjectImages.size} to Homepage`
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Project image grid */}
                                    {currentProject && (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                            {currentProject.images.map((image) => {
                                                const isSelected = selectedProjectImages.has(image._id.toString());
                                                const alreadyAdded = image.alreadyOnHomepage;

                                                return (
                                                    <div
                                                        key={image._id}
                                                        onClick={() => !alreadyAdded && toggleProjectImageSelection(image._id.toString())}
                                                        className={`relative cursor-pointer overflow-hidden rounded-lg transition-all duration-200 ${
                                                            alreadyAdded
                                                                ? 'cursor-not-allowed opacity-40'
                                                                : isSelected
                                                                  ? 'ring-primary scale-[0.97] ring-2'
                                                                  : 'hover:ring-2 hover:ring-stone-500'
                                                        }`}
                                                    >
                                                        <Image
                                                            src={image.thumbnailPath || image.imagePath}
                                                            width={image.thumbnailWidth || image.width}
                                                            height={image.thumbnailHeight || image.height}
                                                            className="aspect-square w-full object-cover"
                                                            alt="Project image"
                                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                                        />

                                                        {/* Selection check */}
                                                        {isSelected && (
                                                            <div className="bg-gold-400 text-body-inverse absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full">
                                                                <Check size={14} />
                                                            </div>
                                                        )}

                                                        {/* Already added overlay */}
                                                        {alreadyAdded && (
                                                            <div className="bg-surface/50 absolute inset-0 flex items-center justify-center">
                                                                <span className="bg-surface-overlay text-body-muted rounded px-2 py-1 text-xs">
                                                                    Already Added
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {currentProject && currentProject.images.length === 0 && (
                                        <div className="text-body-subtle py-12 text-center">This project has no images yet.</div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ─── Tab: Upload New ─────────────────────────────────── */}
                    {addTab === 'upload' && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <ProjectResizeUploader
                                    onUploadComplete={handleUploadComplete}
                                    onResetInputs={() => setPendingUpload(null)}
                                />

                                <div>
                                    <label className="text-body-muted mb-1 block text-sm font-medium">Caption (optional)</label>
                                    <input
                                        type="text"
                                        value={uploadCaption}
                                        onChange={(e) => setUploadCaption(e.target.value)}
                                        className="border-line-strong bg-surface-overlay text-body focus:border-primary w-full rounded-lg border px-3 py-2 focus:outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handleAddUploadedImage}
                                    disabled={!pendingUpload || isAdding}
                                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 w-full rounded-lg py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isAdding ? <Loader2 size={18} className="mx-auto animate-spin" /> : 'Add to Homepage'}
                                </button>
                            </div>

                            {/* Preview */}
                            <div className="bg-surface-raised flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl">
                                {pendingUpload ? (
                                    <Image
                                        src={pendingUpload.originalImageUrl}
                                        width={pendingUpload.originalWidth}
                                        height={pendingUpload.originalHeight}
                                        className="h-full w-full object-cover"
                                        alt="Upload preview"
                                        sizes="50vw"
                                    />
                                ) : (
                                    <div className="text-body-subtle text-center">
                                        <Upload size={48} className="mx-auto mb-3 opacity-40" />
                                        <p></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Tooltip id="homepage-tooltip" className="z-50" />
        </div>
    );
}
