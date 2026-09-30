"use client";


import { useEffect, useState } from "react";
import PostCard from "./components/Postcard";
import type { Post } from "./mocks/posts";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("No se pudieron cargar los posts", error);
      } else {
        setPosts((data ?? []) as Post[]);
      }
      setLoading(false);
    }

    void loadPosts();
  }, []);

  function toggleLike(id: Post["id"]) {
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.likes + (post.isLiked ? -1 : 1),
            }
          : post,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card-bg">
        <div className="mx-auto flex max-w-lg items-center justify-center px-4 py-3">
          <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
            Suplatzigram
          </h1>
        </div>
      </header>
      <main className="mx-auto flex max-w-lg flex-col gap-4 p-3 pb-24">
        {loading ? (
          <p className="py-12 text-center text-sm text-foreground/60">Cargando publicaciones…</p>
        ) : posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={toggleLike} />)
        ) : (
          <p className="py-12 text-center text-sm text-foreground/60">
            Todavía no hay publicaciones para mostrar.
          </p>
        )}
      </main>
    </div>
  );
}
