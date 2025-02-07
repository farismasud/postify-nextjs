import React, { useEffect, useState } from "react";
import {
  getUserProfile,
  getPostsByUserId,
  getFollowersByUserId,
  getFollowingByUserId,
  followUser,
  unfollowUser,
  getLoggedUser,
} from "@/api/api";
import { useRouter } from "next/router";
import FollowerPopup from "./followerPopup";
import FollowingPopup from "./followingPopup";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { CameraIcon, UserIcon, UsersRound } from "lucide-react";

interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  isLike: boolean;
  totalLikes: number;
  user: {
    id: string;
    username: string;
    email: string;
    profilePictureUrl: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  profilePictureUrl: string;
  phoneNumber: string;
  bio: string;
  website: string;
  totalFollowing: number;
  totalFollowers: number;
}

interface Follower {
  id: string;
  username: string;
  profilePictureUrl: string;
  isFollowing: boolean;
}

interface Following {
  id: string;
  username: string;
  profilePictureUrl: string;
  isFollowing: boolean;
}

const Profile = () => {
  const router = useRouter();
  const { id: userId } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const [userResponse, postsResponse, loggedUserResponse] = await Promise.all([
          getUserProfile(userId as string),
          getPostsByUserId(userId as string),
          getLoggedUser(),
        ]);
        setUser(userResponse.data.data);
        setPosts(postsResponse.data.data.posts);
        setLoggedUserId(loggedUserResponse.data.data.id);
        setIsFollowing(
          userResponse.data.data.followers?.some((follower: Follower) => follower.id === loggedUserResponse.data.data.id)
        );
      } catch (error: any) {
        setError(error.message || "Error fetching data");
      }
    };

    fetchData();
  }, [userId]);

  const handleViewFollowers = async () => {
    try {
      const response = await getFollowersByUserId(userId as string);
      setFollowers(response.data.data.users);
      setIsFollowersModalOpen(true);
    } catch (error: any) {
      setError(error.message || "Error fetching followers");
    }
  };

  const handleViewFollowing = async () => {
    try {
      const response = await getFollowingByUserId(userId as string);
      setFollowing(response.data.data.users);
      setIsFollowingModalOpen(true);
    } catch (error: any) {
      setError(error.message || "Error fetching following");
    }
  };

  const closeModal = () => {
    setIsFollowersModalOpen(false);
    setIsFollowingModalOpen(false);
  };

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(userId as string);
        setIsFollowing(false);
        toast.success("Unfollowed successfully");
      } else {
        await followUser(userId as string);
        setIsFollowing(true);
        toast.success("Followed successfully");
      }
    } catch (error: any) {
      setError(error.message || "Error toggling follow state");
      toast.error("Error toggling follow state");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-zinc-800 flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center mb-8 w-full max-w-screen-sm">
        <img
          src={user.profilePictureUrl}
          alt={user.username}
          onError={(e) => {
            e.currentTarget.src =
              "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
          }}
          className="w-32 h-32 rounded-full border-4 border-primary mb-4"
        />
        <h1 className="text-3xl font-semibold text-primary text-zinc-300">{user.username}</h1>
        <p className="text-muted mt-2">{user.bio}</p>
        <div className="flex justify-around w-full mt-6">
          <div className="flex flex-col items-center text-primary">
            <CameraIcon className="w-6 h-6 text-zinc-300" />
            <span className="text-lg font-bold text-zinc-300">Posts</span>
            <span className="text-xl font-bold text-zinc-300">{posts.length}</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-primary"
            onClick={handleViewFollowers}
          >
            <UserIcon className="w-6 h-6 text-zinc-300" />
            <span className="text-lg font-bold text-zinc-300">Followers</span>
            <span className="text-xl font-bold text-zinc-300">{user.totalFollowers}</span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer text-primary"
            onClick={handleViewFollowing}
          >
            <UsersRound className="w-6 h-6 text-zinc-300" />
            <span className="text-lg font-bold text-zinc-300">Following</span>
            <span className="text-xl font-bold text-zinc-300">{user.totalFollowing}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="mt-4"
          onClick={handleFollowToggle}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center items-center mt-8 w-full max-w-screen-lg">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col items-center w-full">
            <img
              src={post.imageUrl}
              alt={post.caption}
              onError={(e) => {
                e.currentTarget.src =
                  "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
              }}
              className="object-cover w-full h-48 rounded-lg cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            />
          </div>
        ))}
      </div>
      {isFollowersModalOpen && (
        <FollowerPopup followers={followers} onClose={closeModal} />
      )}
      {isFollowingModalOpen && (
        <FollowingPopup following={following} onClose={closeModal} />
      )}
    </div>
  );
};

export default Profile;