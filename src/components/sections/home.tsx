import { useEffect, useState } from "react";
import {
  getFollowingPosts,
  getPostById,
  createComment,
  likePost,
  unlikePost,
  deleteComment
} from "@/api/api";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Heart, MessageCircle, Plus } from "lucide-react";

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
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      const response = await getFollowingPosts(10, 1);
      const postsData = await Promise.all(
        response.data.data.posts.map(async (post: Post) => {
          const postResponse = await getPostById(post.id);
          console.log(
            "Fetched post comments:",
            postResponse.data.data.comments
          );
          return {
            ...post,
            isLiked: post.isLiked || false,
            showCommentInput: false,
            comments: postResponse.data.data.comments.map((c: any) => ({
              id: c.id,
              content: c.comment,
              user: c.user,
            })),
          };
        })
      );
      console.log("Posts with comments :", postsData);
      setPosts(postsData);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch posts"
      );
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
    try {
      await likePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post, i) =>
          i === index
            ? { ...post, totalLikes: post.totalLikes + 1, isLiked: true }
            : post
        )
      );
    } catch (err: any) {
      console.error("Like Error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to like post"
      );
    }
  };

  const handleUnlike = async (postId: string, index: number) => {
    try {
      await unlikePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post, i) =>
          i === index
            ? { ...post, totalLikes: post.totalLikes - 1, isLiked: false }
            : post
        )
      );
    } catch (err: any) {
      console.error("Unlike Error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to unlike post"
      );
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const comment = newComment[postId];
    if (!comment) return;
    try {
      const response = await createComment(postId, comment);
      const newCommentData = {
        id: response.data.data.commentId,
        content: comment,
        user: response.data.data.user,
      };
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newCommentData] }
            : post
        )
      );
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (err: any) {
      console.error("Comment Error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to submit comment"
      );
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
                 comments: post.comments.filter(
                   (comment) => comment.id !== commentId
                 ),
               }
             : post
         )
       );
     } catch (err: any) {
       console.error("Delete Comment Error:", err);
       setError(
         err.response?.data?.message ||
           err.message ||
           "Failed to delete comment"
       );
     }
   };

  const toggleCommentInput = (index: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post, i) =>
        i === index
          ? { ...post, showCommentInput: !post.showCommentInput }
          : post
      )
    );
  };

  return (
    <div className="bg-purple flex flex-col items-center justify-center min-h-screen bg-transparent">
      {error && <Alert variant="destructive">{error}</Alert>}
      <div className="flex flex-col gap-6 items-center">
        {" "}
        {posts.map((post: Post, index: number) => (
          <Card
            key={post.id}
            className="p-4 h-auto w-[900px] flex flex-col rounded-lg shadow-lg glassmorphism mb-6">
            {post.user && (
              <div
                className="flex cursor-pointer text-gray-900 mb-5"
                onClick={() => router.push(`/profile/${post.user?.id}`)}
              >
                <img
                  src={post.user?.profilePictureUrl}
                  alt={post.user?.username}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                  }}
                />
                <span className="ml-2 font-bold text-xl">
                  {post.user?.username}
                </span>
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
                className="self-center object-cover w-full h-[50%] rounded-md cursor-pointer"
                onClick={() => handlePostClick(post.id)}
              />
            )}
            <h2 className="mt-2 text-xl font-semibold text-gray-900">
              {post.caption}
            </h2>
            <p className="text-gray-900">
              <span className="font-medium text-gray-900">Total Likes: </span>
              {post.totalLikes}
            </p>

            <div className="flex justify-start items-center mt-4 gap-4">
              <button
                onClick={() => {
                  post.isLiked
                    ? handleUnlike(post.id, index)
                    : handleLike(post.id, index);
                }}
              >
                <Heart
                  color={post.isLiked ? "red" : "black"}
                  fill={post.isLiked ? "red" : "none"}
                />
              </button>
              <button onClick={() => toggleCommentInput(index)}>
                <MessageCircle color="black" />
              </button>
            </div>
            {post.showCommentInput && (
              <div className="mt-4 flex items-center">
                <input
                  type="text"
                  className=" rounded-lg p-2 flex-grow bg-transparent text-gray-900 placeholder-gray-400 border-gray-500"
                  placeholder="Write a comment..."
                  value={newComment[post.id] || ""}
                  onChange={(e) =>
                    setNewComment((prev) => ({
                      ...prev,
                      [post.id]: e.target.value,
                    }))
                  }
                />
                <button
                  className="bg-green-700 text-white hover:text-green-700 hover:bg-white rounded-lg px-4 py-2 ml-2"
                  onClick={() => handleCommentSubmit(post.id)}
                >
                  Submit
                </button>
              </div>
            )}
            <div className="mt-2">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="py-2 flex gap-2 items-center"
                  >
                    <span className="font-bold text-gray-900">
                      {comment.user.username}:
                    </span>
                    <span className="text-gray-800">{comment.content}</span>
                    <button onClick={() =>handleCommentDelete(post.id, comment.id)}>
                      <Plus className="rotate-45 h-7 w-7 hover:text-pink-300 hover:rotate-0 transition ease-linear duration-200" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;