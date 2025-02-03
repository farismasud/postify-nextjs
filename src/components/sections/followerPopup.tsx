import React from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";

interface Follower {
  id: string;
  username: string;
  profilePictureUrl: string;
}

interface FollowerPopupProps {
  followers: Follower[];
  onClose: () => void;
}

const FollowerPopup: React.FC<FollowerPopupProps> = ({
  followers,
  onClose,
}) => {
  const router = useRouter();

  const handleFollowerClick = (id: string) => {
    onClose();
    router.push(`/profile/${id}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black p-6 rounded-lg max-w-md w-full flex flex-col">
        <button
          className="mt-4 w-[25%] bg-transparent text-white px-4 py-2 rounded right-0 flex justify-end self-end"
          onClick={onClose}
        >
          <Plus className="rotate-45 h-7 w-7 hover:text-pink-300 hover:rotate-0 transition ease-linear duration-200" />
        </button>

        <h2 className="text-lg font-bold mb-4 text-white">Followers</h2>
        <ul className="space-y-2">
          {followers.map((follower) => (
            <li
              key={follower.id}
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => handleFollowerClick(follower.id)}
            >
              <img
                src={follower.profilePictureUrl}
                alt={follower.username}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-white">{follower.username}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FollowerPopup;