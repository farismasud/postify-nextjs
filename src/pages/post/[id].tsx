import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPostById, likePost, unlikePost, createComment, deleteComment } from "@/api/api";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

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
}

const PostPage: React.FC = () => {
  const router = useRouter();
  const { id: postId } = router.query;
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState<string>("");

  const fetchPost = async () => {
    if (!postId) return;

    try {
      const response = await getPostById(postId as string);
      if (response.data.code === "200") {
        setPost({
          ...response.data.data,
          comments: response.data.data.comments.map((c: any) => ({
            id: c.id,
            content: c.comment,
            user: {
              id: c.user.id,
              username: c.user.username,
              profilePictureUrl: c.user.profilePictureUrl || "",
            },
          })),
        });
      } else {
        toast({ title: "Error", description: "Post not found", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch post", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    setPost((prev) => prev && { ...prev, totalLikes: prev.totalLikes + 1, isLiked: true });

    try {
      await likePost(post.id);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
      setPost((prev) => prev && { ...prev, totalLikes: prev.totalLikes - 1, isLiked: false });
    }
  };

  const handleUnlike = async () => {
    if (!post) return;
    setPost((prev) => prev && { ...prev, totalLikes: prev.totalLikes - 1, isLiked: false });

    try {
      await unlikePost(post.id);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to unlike post",
        variant: "destructive",
      });
      setPost((prev) => prev && { ...prev, totalLikes: prev.totalLikes + 1, isLiked: true });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    try {
      await createComment(post.id, newComment);
      fetchPost(); // Ambil data terbaru setelah komentar ditambahkan
      setNewComment("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!post) return;
    try {
      await deleteComment(commentId);
      setPost((prev) =>
        prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) } : null
      );
      toast({ title: "Success", description: "Comment deleted successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    }
  };

  if (!post) return <div>Post not found.</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-800 p-4">
      <div className="w-full max-w-[700px]">
        <Card className="p-5 bg-white rounded-lg shadow-sm">
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
              className="w-full h-auto rounded-md cursor-pointer mb-4"
              onClick={() => router.push(`/post/${post.id}`)}
            />
          )}
          <p className="text-gray-900 mb-4">{post.caption}</p>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={post.isLiked ? handleUnlike : handleLike}
                className="flex items-center gap-2"
              >
                <Heart
                  size={20}
                  color={post.isLiked ? "red" : "black"}
                  fill={post.isLiked ? "red" : "none"}
                />
                <span className="text-gray-700">{post.totalLikes}</span>
              </button>
              <button className="flex items-center gap-2">
                <MessageCircle size={20} color="black" />
                <span className="text-gray-700">{post.comments.length}</span>
              </button>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 mb-3">Comments:</h3>
          <ul className="space-y-2 text-gray-900">
            {post.comments.map((comment) => (
              <li key={comment.id} className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={comment.user.profilePictureUrl}
                    alt={comment.user.username}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                    }}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex flex-col">
                    <p className="font-bold text-gray-900">{comment.user.username}</p>
                    <span className="text-gray-700">{comment.content}</span>
                  </div>
                </div>
                <button onClick={() => handleCommentDelete(comment.id)}>
                  <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleCommentSubmit} className="flex gap-2 w-full border rounded-full p-2 mt-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border-none focus:ring-0"
            />
            <Button type="submit" variant="secondary" className="hover:bg-zinc-200 text-black transition-colors">
              <Send size={20} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PostPage;
