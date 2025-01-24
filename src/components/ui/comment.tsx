import React, { useState } from "react";
import { Card } from "./card";

interface CommentInputProps {
  postId: string;
  onCommentSubmit: (postId: string, comment: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  onCommentSubmit,
}) => {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && comment.trim()) {
      onCommentSubmit(postId, comment.trim());
      setComment(""); // Kosongkan input setelah submit
    }
  };

  return (
    <Card className="mt-4 bg-white w-36 h-16">
      <input
        type="text"
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={handleSubmit}
        className="border p-2 rounded-md w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </Card>
  );
};

export default CommentInput;
