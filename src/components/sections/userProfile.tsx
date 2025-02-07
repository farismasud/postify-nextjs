import React, { useEffect, useState } from "react";
import {
  getLoggedUser,
  getPostsByUserId,
  getFollowersByUserId,
  getFollowingByUserId,
} from "@/api/api";
import FollowerPopup from "./followerPopup";
import FollowingPopup from "./followingPopup";
import UpdateProfile from "./updateProfile";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
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

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await getLoggedUser();
        if (userResponse.data.code === "200") {
          const loggedUser = userResponse.data.data;
          setUser(loggedUser);

          const postsResponse = await getPostsByUserId(loggedUser.id);
          if (postsResponse.data.code === "200") {
            setPosts(postsResponse.data.data.posts);
          } else {
            setError(postsResponse.data.message);
          }
        } else {
          setError(userResponse.data.message);
        }
      } catch (error: any) {
        setError(error.message || "Error fetching data");
      }
    };

    fetchData();
  }, []);

  const handleViewFollowers = async () => {
    if (!user) return;

    try {
      const response = await getFollowersByUserId(user.id);
      if (response.data.code === "200") {
        setFollowers(response.data.data.users);
        setIsFollowersModalOpen(true);
      } else {
        setError(response.data.message);
      }
    } catch (error: any) {
      setError(error.message || "Error fetching followers");
    }
  };

  const handleViewFollowing = async () => {
    if (!user) return;

    try {
      const response = await getFollowingByUserId(user.id);
      if (response.data.code === "200") {
        setFollowing(response.data.data.users);
        setIsFollowingModalOpen(true);
      } else {
        setError(response.data.message);
      }
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

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-zinc-800 flex flex-col items-center justify-start min-h-screen p-4">
      <div className="flex flex-col items-center mb-6 w-full max-w-screen-sm">
        <img
          src={user.profilePictureUrl}
          alt={user.username}
          onError={(e) => {
            e.currentTarget.src =
              "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
          }}
          className="w-32 h-32 rounded-full border-4 border-primary mb-4"
        />
        <h1 className="text-3xl font-semibold text-primary">{user.username}</h1>
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
      </div>
      <Button
        variant="outline"
        size="lg"
        className="mt-4"
        onClick={() => setIsModalOpen(true)}
      >
        Edit Profile
      </Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center items-center mt-8 w-full max-w-screen-lg">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col items-center w-full">
            <img
              src={post.imageUrl}
              alt={post.caption}
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-60 bg-gray-900 flex justify-center items-center">
          <div className="bg-zinc-300 p-8 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <UpdateProfile />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;