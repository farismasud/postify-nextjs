import React, { useState, useEffect } from "react";
import { getPostById, createComment, likePost, unlikePost } from "@/api/api";

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
}

const PostCard: React.FC<CardProps> = ({ postId }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

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

  if (!post) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto my-4">
      <div className="flex">
        <div className="w-1/2">
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"; // Set placeholder image on error
            }}
          />
        </div>
        <div className="w-1/2 p-4 flex flex-col">
          <div className="flex items-center mb-4">
            {post.user ? (
              <>
                <img
                  src={post.user.profilePictureUrl}
                  alt={post.user.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className="font-bold text-black">
                  {post.user.username}
                </span>
              </>
            ) : (
              <span className="font-bold text-gray-500">Unknown User</span>
            )}
          </div>
          <p className="text-gray-700 mb-4">{post.caption}</p>
          <div className="mb-4">
            <button
              onClick={handleLikeToggle}
              className={`mr-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}
            >
              {isLiked ? "❤️" : "🤍"} {post.totalLikes}
            </button>
          </div>
          <div className="flex-grow overflow-y-auto mb-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex mb-2">
                <img
                  src={comment.user.profilePictureUrl}
                  alt={comment.user.username}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <p className="text-gray-700">
                  <span className="font-semibold">{comment.user.username}</span>
                  : {comment.comment}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 pl-10 text-sm text-gray-700"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCard;