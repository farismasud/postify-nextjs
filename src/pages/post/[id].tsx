import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPostById } from "@/api/api";

interface User {
  id: string;
  username: string;
  profilePictureUrl: string;
}

interface Comment {
  id: string;
  comment: string;
  user: User;
}

interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  user: User;
  comments: Comment[];
}

const PostPage: React.FC = () => {
  const router = useRouter();
  const { id: postId } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        const response = await getPostById(postId as string); // Call your API function
        if (response.data.code === "200") {
          setPost(response.data.data);
        } else {
          setError("Post not found"); // Handle case where post isn't found
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("An error occurred while fetching the post."); // Set a user-friendly error message
      }
    };

    fetchPost();
  }, [postId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  return (
    <div className="h-full p-4 flex flex-col justify-center items-center">
      <div className="w-[50vw]">
        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="w-[50vw] h-auto rounded"
          />
        </div>
        <div className="flex items-center justify-start w-full h-auto mb-2 gap-2">
          <img
            src={post.user.profilePictureUrl}
            alt={post.user.username}
            onError={(e) => {
              e.currentTarget.src =
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
            }}
            className="w-10 h-10 rounded-full mr-2"
          />
          <div className="flex flex-col">
            <p className="font-bold text-gray-900">{post.user.username}</p>
            <p className="text-gray-900">{post.caption}</p>
          </div>
        </div>
        <h3 className="font-bold text-gray-900 mb-3">Comments:</h3>
        <ul className="space-y-2 text-gray-900">
          {post.comments.map((comment) => (
            <li key={comment.id} className="flex items-start space-x-2">
              <img
                src={comment.user.profilePictureUrl}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <p className="font-bold text-gray-900">
                    {comment.user.username}
                  </p>
                  <span className="text-gray-700 ml-2">{comment.comment}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PostPage;