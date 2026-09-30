"use client";

import Image from "next/image";
import type { Post } from "../mocks/posts";
import { getTimeAgo } from "../utils/time";
import { HeartIcon } from "./Hearticon";

type ModalProps = {
	post: Post;
	onClose: () => void;
};

export default function Modal({ post, onClose }: ModalProps) {
	const username = post.user?.username || "Drax";

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label={`Foto de ${username}`}
		>
			<section
				className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card-bg shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
					aria-label="Cerrar"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
						className="h-5 w-5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div className="order-1 flex items-center gap-3 border-b border-border bg-card-bg p-4">
					<div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary">
						<Image
							src={
								post.user?.avatar ||
								"https://sqlkltbinziklapgzwif.supabase.co/storage/v1/object/public/Supagram/th.webp"
							}
							alt={username}
							fill
							sizes="40px"
							className="object-cover"
						/>
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-foreground">{username}</span>
						<span className="text-xs text-foreground/50">
							{getTimeAgo(new Date(post.created_at))}
						</span>
					</div>
				</div>

				<div className="relative order-2 aspect-square w-full shrink-0 bg-black">
					<Image
						src={post.image_url}
						alt={`Post de ${username}`}
						fill
						sizes="(max-width: 672px) 100vw, 640px"
						className="object-contain"
					/>
				</div>

				<div className="order-3 overflow-y-auto bg-card-bg p-4">
					<div className="flex items-center gap-2">
						<HeartIcon filled />
						<span className="text-lg font-bold text-foreground">
							{post.likes.toLocaleString()} likes
						</span>
					</div>
					<p className="mt-3 text-sm leading-6 text-foreground">
						<span className="font-semibold">{username}</span>{" "}
						<span className="text-foreground/80">{post.caption}</span>
					</p>
				</div>
			</section>
		</div>
	);
}
