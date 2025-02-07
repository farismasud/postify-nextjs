import { useEffect, useState } from "react";
import {
  getFollowingPosts,
  getPostById,
  createComment,
  likePost,
  unlikePost,
  deleteComment,
} from "@/api/api";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StoryComponent from "@/components/sections/story";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  profilePictureUrl: string;
}

interface Comment {
  id: string;
  content: string;
  user: User;
}

interface Post {
  id: string;
  caption: string;
  imageUrl?: string;
  totalLikes: number;
  user?: User;
  isLiked?: boolean;
  comments: Comment[];
  showCommentInput?: boolean;
  showComments?: boolean;
}

const Home = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      const response = await getFollowingPosts();
      const postsData = await Promise.all(
        response.data.data.posts.map(async (post: Post) => {
          const postResponse = await getPostById(post.id);
          return {
            ...post,
            isLiked: post.isLiked || false,
            showCommentInput: false,
            showComments: false,
            comments: postResponse.data.data.comments.map((c: any) => ({
              id: c.id,
              content: c.comment,
              user: {
                id: c.user.id,
                username: c.user.username,
                profilePictureUrl: c.user.profilePictureUrl || "",
              },
            })),
          };
        })
      );
      setPosts(postsData);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleLike = async (postId: string, index: number) => {
    setPosts((prev) =>
      prev.map((post, i) =>
        i === index ? { ...post, totalLikes: post.totalLikes + 1, isLiked: true } : post
      )
    );

    try {
      await likePost(postId);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
      setPosts((prev) =>
        prev.map((post, i) =>
          i === index ? { ...post, totalLikes: post.totalLikes - 1, isLiked: false } : post
        )
      );
    }
  };

  const handleUnlike = async (postId: string, index: number) => {
    setPosts((prev) =>
      prev.map((post, i) =>
        i === index ? { ...post, totalLikes: post.totalLikes - 1, isLiked: false } : post
      )
    );

    try {
      await unlikePost(postId);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to unlike post",
        variant: "destructive",
      });
      setPosts((prev) =>
        prev.map((post, i) =>
          i === index ? { ...post, totalLikes: post.totalLikes + 1, isLiked: true } : post
        )
      );
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, postId: string, index: number) => {
    e.preventDefault();
    if (!newComment[postId]?.trim()) return;

    try {
      await createComment(postId, newComment[postId]);

      // Ambil data terbaru dari post setelah komentar dibuat
      const response = await getPostById(postId);
      const updatedComments = response.data.data.comments.map((c: any) => ({
        id: c.id,
        content: c.comment,
        user: {
          id: c.user.id,
          username: c.user.username,
          profilePictureUrl: c.user.profilePictureUrl || "",
        },
      }));

      // Update state post untuk menambahkan komentar baru
      setPosts((prev) =>
        prev.map((post, i) =>
          i === index ? { ...post, comments: updatedComments } : post
        )
      );

      // Reset input komentar hanya untuk post yang sesuai
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };


  const handleCommentDelete = async (postId: string, commentId: string) => {
    try {
      await deleteComment(commentId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter((comment) => comment.id !== commentId),
              }
            : post
        )
      );
      toast({ title: "Success", description: "Comment deleted successfully" });
    } catch (err: any) {
      console.error("Delete Comment Error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const toggleCommentInput = (index: number) => {
    setPosts((prev) =>
      prev.map((post, i) =>
        i === index ? { ...post, showCommentInput: !post.showCommentInput } : post
      )
    );
  };

  const toggleComments = (index: number) => {
    setPosts((prev) =>
      prev.map((post, i) =>
        i === index ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-800">
      <div className="w-full max-w-[650px]">
        <StoryComponent />
      </div>
      <div className="flex flex-col gap-4 w-full max-w-[600px] mt-4">
        {posts.map((post: Post, index: number) => (
          <Card
            key={post.id}
            className="p-4 bg-white rounded-lg shadow-sm"
          >
            {post.user && (
              <div
                className="flex cursor-pointer items-center mb-4"
                onClick={() => router.push(`/profile/${post.user?.id}`)}
              >
                <img
                  src={post.user?.profilePictureUrl}
                  alt={post.user?.username}
                  className="w-10 h-10 rounded-full mr-2"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                  }}
                />
                <span className="font-bold text-lg">{post.user?.username}</span>
              </div>
            )}
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.caption}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                }}
                className="w-full h-auto rounded-md cursor-pointer mb-4"
                onClick={() => handlePostClick(post.id)}
              />
            )}
            <p className="text-gray-900 mb-4">{post.caption}</p>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    post.isLiked ? handleUnlike(post.id, index) : handleLike(post.id, index);
                  }}
                  className="flex items-center gap-2"
                >
                  <Heart
                    size={20}
                    color={post.isLiked ? "red" : "black"}
                    fill={post.isLiked ? "red" : "none"}
                  />
                  <span className="text-gray-700">{post.totalLikes}</span>
                </button>
                <button
                  onClick={() => {
                    toggleComments(index);
                    toggleCommentInput(index);
                  }}
                  className="flex items-center gap-2"
                >
                  <MessageCircle size={20} color="black" />
                  <span className="text-gray-700">{post.comments.length}</span>
                </button>
              </div>
            </div>
            {post.showCommentInput && (
              <div className="flex items-center gap-2 mb-4">
                <form
                onSubmit={(e) => handleCommentSubmit(e, post.id, index)}
                className="flex gap-2 w-full border rounded-full p-2">
                  <input
                    type="text"
                    value={newComment[post.id] || ""}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Add a comment..."
                    className="flex-1 border-zinc-200 focus:ring-2 focus:ring-blue-500"/>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="hover:bg-zinc-200 text-black transition-colors">
                    <Send size={20} />
                  </Button>
                </form>
              </div>
            )}
            {post.showComments && post.comments.length > 0 && (
              <div className="mt-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{comment.user.username}:</span>
                      <span className="text-sm text-gray-700">{comment.content}</span>
                    </div>
                    <button onClick={() => handleCommentDelete(post.id, comment.id)}>
                      <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;