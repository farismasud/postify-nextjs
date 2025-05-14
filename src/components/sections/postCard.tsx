import React, { useState, useEffect } from "react";
import { getPostById, createComment, likePost, unlikePost } from "@/api/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Send } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  isLike: boolean;
  totalLikes: number;
  user: {
    id: string;
    username: string;
    profilePictureUrl: string;
  } | null;
  comments: Array<{
    id: string;
    comment: string;
    user: {
      username: string;
      profilePictureUrl: string;
    };
  }>;
}

interface CardProps {
  postId: string;
  onClose?: () => void;
}

const PostCard: React.FC<CardProps> = ({ postId, onClose }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getPostById(postId);
        setPost(response.data.data);
        setIsLiked(response.data.data.isLike);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment(postId, newComment);
      const response = await getPostById(postId);
      setPost(response.data.data);
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      const response = await getPostById(postId);
      setPost(response.data.data);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  if (!post) return <Skeleton className="h-64 w-full" />;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <Card className="bg-white text-gray-900 rounded-xl p-6 w-full max-w-md mx-auto relative shadow-xl transition-transform duration-200 transform ${isClosing ? 'scale-95' : 'scale-100'}">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full hover:bg-gray-100 transition-colors"
          onClick={handleClose}
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>

        <div className="flex items-center mb-6">
          {post.user ? (
            <>
              <img
                src={post.user.profilePictureUrl}
                alt={post.user.username}
                className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                }}
              />
              <Link href={`/profile/${post.user.id}`} passHref>
                <span className="font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
                  {post.user.username}
                </span>
              </Link>
            </>
          ) : (
            <span className="font-bold text-gray-500">Unknown User</span>
          )}
        </div>

        <div className="rounded-lg overflow-hidden mb-4">
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
            }}
          />
        </div>

        <p className="text-sm text-gray-800 mb-4">{post.caption}</p>

        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={handleLikeToggle}
            className={`p-2 hover:bg-gray-100 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            {isLiked ? "❤️" : "🤍"} {post.totalLikes}
          </Button>
        </div>

        <div className="max-h-40 overflow-y-auto mb-4 space-y-3">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-2">
              <img
                src={comment.user.profilePictureUrl}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"; // Set placeholder image on error
                }}
              />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">{comment.user.username}</span>{" "}
                  <span className="text-gray-800">{comment.comment}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <Input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border-zinc-200 focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            variant="secondary"
            className="hover:bg-zinc-200 text-black transition-colors"
          >
            <Send size={20} />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PostCard;