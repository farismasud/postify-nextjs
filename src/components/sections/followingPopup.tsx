import React, { useState } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";

interface Following {
  id: string;
  username: string;
  profilePictureUrl: string;
}

interface FollowingPopupProps {
  following: Following[];
  onClose: () => void;
}

const ITEMS_PER_PAGE = 5;

const FollowingPopup: React.FC<FollowingPopupProps> = ({ following, onClose }) => {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const handleFollowingClick = (id: string) => {
    onClose();
    router.push(`/profile/${id}`);
  };

  const startIndex = page * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFollowing = following.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-600 p-6 rounded-lg max-w-md w-full flex flex-col">
        <button className="mt-4 w-[25%] bg-transparent text-white flex justify-end self-end" onClick={onClose}>
          <Plus className="rotate-45 h-7 w-7 hover:text-pink-300 hover:rotate-0 transition ease-linear duration-200" />
        </button>

        <h2 className="text-lg font-bold mb-4 text-white">Following</h2>
        <ul className="space-y-2">
          {paginatedFollowing.map((user) => (
            <li key={user.id} className="flex items-center space-x-4 cursor-pointer" onClick={() => handleFollowingClick(user.id)}>
              <img src={user.profilePictureUrl} alt={user.username} className="w-10 h-10 rounded-full" />
              <span className="text-white">{user.username}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <button className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50" disabled={endIndex >= following.length} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowingPopup;
