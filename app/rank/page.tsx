"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeartIcon } from "../components/Hearticon";
import Modal from "../components/Modal";
import type { Post } from "../mocks/posts";
import { supabase } from "../lib/supabase";

export default function RankPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    async function loadPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select()
        .order("likes", { ascending: false });

      if (error) {
        console.error("No se pudieron cargar los posts del ranking", error);
        return;
      }

      setPosts((data ?? []) as Post[]);
    }

    void loadPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card-bg">
        <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-3">
          <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
            Ranking
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-2">
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post, index) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                aria-label={`Ver publicación en puesto ${index + 1}`}
                className="group relative aspect-square overflow-hidden"
              >
                <Image
                  src={post.image_url}
                  alt={`Post con ${post.likes} likes`}
                  fill
                  sizes="(max-width: 672px) 33vw, 220px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white shadow-md">
                  {index + 1}
                </span>
                <span className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <HeartIcon filled />
                  <span className="font-semibold text-white">
                    {post.likes.toLocaleString()}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-foreground/60">
            Todavía no hay publicaciones para mostrar.
          </p>
        )}
      </main>

      {selectedPost && (
        <Modal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}