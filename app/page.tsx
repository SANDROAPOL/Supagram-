"use client";

import { useEffect, useState } from "react";
import PostCard from "./components/Postcard";
import { supabase } from "./lib/supabase";
import type { Post } from "./types";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleLike = (postId: number | string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes_count: post.isLiked ? Math.max(post.likes_count - 1, 0) : post.likes_count + 1,
            }
          : post
      )
    );
  };

  const handleComment = async (postId: number | string, body: string) => {
    if (!currentUserId || !body.trim()) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...(post.comments ?? []),
                {
                  id: `${postId}-${Date.now()}`,
                  user_id: currentUserId,
                  post_id: postId,
                  body,
                  created_at: new Date(),
                  profile: {
                    username: "Tú",
                    avatar_url: null,
                  },
                },
              ],
            }
          : post
      )
    );
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };

    const fetchPosts = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, user_id, image_url, caption, likes, created_at")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error al obtener los posts:", {
          message: postsError.message,
          code: postsError.code,
          details: postsError.details,
          hint: postsError.hint,
        });
        return;
      }

      const postRows = postsData ?? [];
      const userIds = [...new Set(postRows.map((post) => post.user_id))];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error al obtener los perfiles:", profilesError);
      }

      const profilesMap = new Map(
        (profilesData ?? []).map((profile) => [profile.id, profile])
      );

      const postsWithProfiles: Post[] = postRows.map((post) => ({
        id: post.id,
        user_id: post.user_id,
        profile: profilesMap.get(post.user_id) ?? {
          username: "usuario",
          avatar_url: null,
        },
        image_url: post.image_url,
        caption: post.caption,
        likes_count: Number(post.likes ?? 0),
        isLiked: false,
        comments: [],
        created_at: new Date(post.created_at),
      }));

      setPosts(postsWithProfiles);
    };

    fetchCurrentUser();
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
          <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Supagram
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      </main>
    </div>
  );
}