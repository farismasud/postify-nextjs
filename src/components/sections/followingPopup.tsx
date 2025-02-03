import React from "react";
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

const FollowingPopup: React.FC<FollowingPopupProps> = ({
  following,
  onClose,
}) => {
  const router = useRouter();

  const handleFollowingClick = (id: string) => {
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

        <h2 className="text-lg font-bold mb-4 text-white">Following</h2>
        <ul className="space-y-2">
          {following.map((following) => (
            <li
              key={following.id}
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() =>handleFollowingClick(following.id)}
            >
              <img
                src={following.profilePictureUrl}
                alt={following.username}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-white">{following.username}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FollowingPopup;