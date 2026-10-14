"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import { supabase } from "../lib/client";
import { HeartIcon } from "../components/Hearticon";
import Modal from "../components/Modal";
import { Post } from "../types";

export default function RankPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id, image_url, caption, user_id, created_at");

        if (postsError) throw postsError;

        if (!postsData.length) {
          setPosts([]);
          return;
        }

        const userIds = [...new Set(postsData.map((post) => post.user_id))];
        const postIds = postsData.map((post) => post.id);

        const [
          { data: profilesData, error: profilesError },
          { data: likesData, error: likesError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds),
          supabase
            .from("likes")
            .select("post_id")
            .in("post_id", postIds),
        ]);

        if (profilesError) throw profilesError;
        if (likesError) throw likesError;

        const profilesMap = new Map(
          profilesData.map((profile) => [
            profile.id,
            { username: profile.username, avatar_url: profile.avatar_url },
          ])
        );

        const likesCountMap = new Map<string | number, number>();
        likesData.forEach((like) => {
          likesCountMap.set(
            like.post_id,
            (likesCountMap.get(like.post_id) ?? 0) + 1
          );
        });

        const rankedPosts: Post[] = postsData
          .map((post) => ({
            ...post,
            profile: profilesMap.get(post.user_id) ?? {
              username: "usuario",
              avatar_url: null,
            },
            likes_count: likesCountMap.get(post.id) ?? 0,
          }))
          .sort((a, b) => b.likes_count - a.likes_count);

        setPosts(rankedPosts);
      } catch (error) {
        console.error("Error al cargar el ranking:", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el ranking."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card-bg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ranking
          </h1>
        </div>
      </header>

      {/* Grid de posts */}
      <main className="max-w-2xl mx-auto p-2">
        {isLoading ? (
          <p className="py-12 text-center text-foreground/60">Cargando ranking...</p>
        ) : loadError ? (
          <p role="alert" className="py-12 text-center text-red-500">
            No se pudo cargar el ranking: {loadError}
          </p>
        ) : posts.length === 0 ? (
          <p className="py-12 text-center text-foreground/60">
            Aún no hay publicaciones para mostrar.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square overflow-hidden group"
              >
                <Image
                  src={post.image_url}
                  alt={`Post con ${post.likes_count} likes`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <HeartIcon size="sm" />
                  <span className="text-white font-semibold">
                    {post.likes_count.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedPost && (
        <Modal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}