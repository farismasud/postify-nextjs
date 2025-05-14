import { useEffect, useState, useRef } from "react";
import { getExplorePosts } from "@/api/api";
import { Toast, ToastAction, ToastProvider } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import PostCard from "@/components/sections/postCard";

interface User {
  id: string;
  username: string;
  profilePictureUrl: string;
}

interface Post {
  id: string;
  caption: string;
  imageUrl?: string;
  totalLikes: number;
  user?: User;
  isLiked?: boolean;
}

const Explore = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPosts = async (page: number) => {
    try {
      const response = await getExplorePosts(10, page);
      const postsData = response.data.data.posts.map((post: Post) => ({
        ...post,
        isLiked: post.isLiked || false,
      }));
      setPosts((prevPosts) => [...prevPosts, ...postsData]);
      if (postsData.length === 0) {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch posts"
      );
      setToastMessage("Failed to fetch posts!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const lastPostRef = (node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  const handleClosePostCard = () => {
    setSelectedPostId(null);
  };

  return (
    <ToastProvider>
      <div className="flex flex-col items-center min-h-screen bg-zinc-800 p-4">
        {error && (
          <Toast>
            <div className="toast-body">{error}</div>
            <ToastAction altText="Close" />
          </Toast>
        )}

        {/* Grid Layout */}
        <div className="w-full max-w-[600px] space-y-4">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full rounded-lg" />
              ))
            : posts
                .filter((post) => post.imageUrl) // Filter hanya postingan dengan imageUrl
                .map((post, index, filteredPosts) => (
                  <div
                    key={post.id}
                    ref={
                      index === filteredPosts.length - 1 ? lastPostRef : null
                    } // Update ref untuk filtered array
                    onClick={() => setSelectedPostId(post.id)}
                    className="bg-white rounded-lg shadow-sm border border-zinc-900 cursor-pointer"
                  >
                    {/* User Info */}
                    {post.user && (
                      <div className="flex items-center p-4">
                        <img
                          src={post.user.profilePictureUrl}
                          alt={post.user.username}
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                          }}
                        />
                        <span className="font-bold text-lg text-gray-600">
                          {post.user.username}
                        </span>
                      </div>
                    )}

                    {/* Post Image */}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.caption}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                        }}
                      />
                    )}

                    {/* Caption */}
                    <div className="p-4">
                      <p className="text-gray-600 mb-2">{post.caption}</p>
                    </div>
                  </div>
                ))}
        </div>

        {/* Post Card Modal */}
        {selectedPostId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <PostCard postId={selectedPostId} onClose={handleClosePostCard} />
          </motion.div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <Toast>
            <div className="toast-body">{toastMessage}</div>
            <ToastAction altText="Close" onClick={() => setToastMessage(null)} />
          </Toast>
        )}
      </div>
    </ToastProvider>
  );
};

export default Explore;