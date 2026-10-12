"use client";

import { useEffect, useState } from "react";
import PostCard from "./components/Postcard";
import { supabase } from "./lib/supabase";
import type { Post } from "./mocks/posts";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  const handleLike = (postId: number | string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  useEffect(() => {
    const fetchPosts = async () => {
      // 1. Obtener posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error al obtener los posts:", postsError);
        return;
      }

      // 2. Obtener IDs únicos de usuarios
      const postRows = postsData ?? [];
      const userIds = [...new Set(postRows.map((post: { user_id: string }) => post.user_id))];

      // 3. Buscar profiles de esos usuarios
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error al obtener los perfiles:", profilesError);
        return;
      }

      // 4. Crear mapa de profiles por ID
      const profilesMap = new Map(
        (profilesData ?? []).map(
          (profile: { id: string; username: string | null; avatar_url: string | null }) => [
            profile.id,
            { username: profile.username, avatar_url: profile.avatar_url },
          ] as const
        )
      );

      // 5. Combinar posts con profiles
      const postsWithProfiles: Post[] = postRows.map((post: {
        id: number | string;
        user_id: string;
        image_url: string;
        caption: string;
        likes: number;
        created_at: string;
      }) => {
        const profile = profilesMap.get(post.user_id);

        return {
        ...post,
          user: {
            username: profile?.username || "Drax",
            avatar: profile?.avatar_url || "https://sqlkltbinziklapgzwif.supabase.co/storage/v1/object/public/Supagram/th.webp",
          },
          isLiked: false,
        };
      });

      setPosts(postsWithProfiles);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Supagram
          </h1>
        </div>
      </header>

      {/* Feed de posts */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      </main>
    </div>
  );
}