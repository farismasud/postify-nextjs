import React, { useState } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser } from "@/api/api";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Follower {
  id: string;
  username: string;
  profilePictureUrl: string;
  isFollowing: boolean;
}

interface FollowerPopupProps {
  followers: Follower[];
  onClose: () => void;
}

const FollowerPopup: React.FC<FollowerPopupProps> = ({ followers, onClose }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [localFollowers, setLocalFollowers] = useState(followers);

  const handleFollowerClick = (id: string) => {
    onClose();
    router.push(`/profile/${id}`);
  };

  const handleFollowToggle = async (userId: string, isCurrentlyFollowing: boolean) => {
    try {
      if (isCurrentlyFollowing) {
        // Lakukan unfollow
        const response = await unfollowUser(userId);
        console.log("Unfollow response:", response.data);
        toast({ title: "Unfollowed successfully" });

        // Perbarui state followers
        setLocalFollowers((prev) =>
          prev.map((follower) =>
            follower.id === userId ? { ...follower, isFollowing: false } : follower
          )
        );
      } else {
        // Lakukan follow
        const response = await followUser(userId);
        console.log("Follow response:", response.data);
        toast({ title: "Followed successfully" });

        // Perbarui state followers
        setLocalFollowers((prev) =>
          prev.map((follower) =>
            follower.id === userId ? { ...follower, isFollowing: true } : follower
          )
        );
      }
    } catch (error: any) {
      console.error("Follow/Unfollow Error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-auto p-6 flex flex-col bg-zinc-300">
            <button
              className="flex items-center justify-end self-end mb-4"
              onClick={onClose}
            >
              <Plus className="rotate-45 h-7 w-7 hover:text-red-500 hover:rotate-0 transition ease-linear duration-200 text-black" />
            </button>

        <h2 className="text-2xl font-bold text-gray-800">Followers</h2>

        <ScrollArea className="h-72 w-full">
          <ul className="divide-y divide-gray-200">
            {localFollowers.map((user) => (
              <li key={user.id} className="flex items-center justify-between py-3">
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => handleFollowerClick(user.id)}
                >
                  <img
                    src={user.profilePictureUrl}
                    alt={user.username}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                    }}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="text-lg font-medium text-gray-700">{user.username}</span>
                </div>
                <Button
                  variant={user.isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(user.id, user.isFollowing);
                  }}
                >
                  {user.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
};

export default FollowerPopup;
