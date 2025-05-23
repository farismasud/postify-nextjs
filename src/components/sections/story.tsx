import { useEffect, useState } from "react";
import {
  getMyFollowingStory,
  getMyStory,
  createStory,
  deleteStory,
} from "@/api/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, X, Upload } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Added for navigation

interface User {
  id: string;
  username: string;
  profilePictureUrl: string;
}

interface Story {
  id: string;
  imageUrl: string;
  caption: string;
  user: User;
}

interface UserStories {
  user: User;
  stories: Story[];
}

const StoryComponent = () => {
  const { toast } = useToast();
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [selectedUserStories, setSelectedUserStories] = useState<UserStories | null>(null);
  const [newStory, setNewStory] = useState<{ imageUrl: string; caption: string }>({
    imageUrl: "",
    caption: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const responseMyFollowingStory = await getMyFollowingStory();
      const responseMyStory = await getMyStory();
      const allStories = [
        ...responseMyFollowingStory.data.data.stories,
        ...responseMyStory.data.data.stories,
      ];

      const groupedStories = allStories.reduce(
        (acc: { [key: string]: UserStories }, story: Story) => {
          if (!acc[story.user.id]) {
            acc[story.user.id] = {
              user: story.user,
              stories: [],
            };
          }
          acc[story.user.id].stories.push(story);
          return acc;
        },
        {}
      );

      const userStoriesArray: UserStories[] = Object.values(groupedStories);
      setUserStories(userStoriesArray);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.imageUrl.trim() || !newStory.caption.trim()) {
      toast({
        title: "Warning",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await createStory(newStory.imageUrl, newStory.caption);
      const createdStory = response.data.data;

      if (!createdStory || !createdStory.id) {
        throw new Error("Story ID is missing");
      }

      setUserStories((prev) => {
        const updated = [...prev];
        const myUserId = createdStory.user.id;
        const userIndex = updated.findIndex((us) => us.user.id === myUserId);
        if (userIndex >= 0) {
          updated[userIndex].stories.push(createdStory);
        } else {
          updated.unshift({
            user: createdStory.user,
            stories: [createdStory],
          });
        }
        return updated;
      });

      setNewStory({ imageUrl: "", caption: "" });
      setIsOpen(false);
      toast({ title: "Success", description: "Story created successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string, userId: string) => {
    try {
      await deleteStory(storyId);
      setUserStories((prev) =>
        prev
          .map((us) =>
            us.user.id === userId
              ? { ...us, stories: us.stories.filter((s) => s.id !== storyId) }
              : us
          )
          .filter((us) => us.stories.length > 0)
      );
      toast({ title: "Success", description: "Story deleted successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete story",
        variant: "destructive",
      });
    }
  };

  const handleStoryNavigation = (direction: "prev" | "next") => {
    if (!selectedUserStories) return;
    if (
      direction === "next" &&
      currentStoryIndex < selectedUserStories.stories.length - 1
    ) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else if (direction === "prev" && currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  const handleUserClick = (userStories: UserStories) => {
    setSelectedUserStories(userStories);
    setCurrentStoryIndex(0);
  };

  return (
    <div className="p-6 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <ScrollArea className="w-full pb-4">
          <div className="flex gap-4">
            {/* Tombol Buat Story */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="w-[5rem] h-[5rem] aspect-square flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                  <Plus size={24} className="text-blue-500" />
                  <span className="text-xs text-blue-500 mt-1">New Story</span>
                </button>
              </DialogTrigger>
              <DialogContent className="p-6 rounded-xl bg-white shadow-xl w-96">
                <DialogTitle className="text-lg font-semibold text-gray-800">
                  Create Story
                </DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new story.
                </DialogDescription>
                <form onSubmit={handleCreateStory} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newStory.imageUrl}
                        onChange={(e) =>
                          setNewStory((prev: { imageUrl: string; caption: string }) => ({
                            ...prev,
                            imageUrl: e.target.value,
                          }))
                        }
                        placeholder="Enter image URL"
                        className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      />
                      <Upload className="absolute right-3 top-3 text-black" size={20} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Caption
                    </label>
                    <textarea
                      value={newStory.caption}
                      onChange={(e) =>
                        setNewStory((prev: { imageUrl: string; caption: string }) => ({
                          ...prev,
                          caption: e.target.value,
                        }))
                      }
                      placeholder="Write a caption..."
                      className="w-full p-3 border rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="default"
                    className="w-full shadow-md hover:shadow-lg font-medium transition-colors"
                  >
                    {loading ? "Creating..." : "Create Story"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Lingkaran Story per Akun */}
            {userStories.map((userStory) => (
              <div
                key={userStory.user.id}
                className="relative group cursor-pointer"
                onClick={() => handleUserClick(userStory)}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500">
                  <img
                    src={userStory.user.profilePictureUrl || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                    alt={userStory.user.username}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                    }}
                  />
                </div>
                <p className="text-xs text-center mt-1 text-gray-600 font-medium truncate w-20">
                  {userStory.user.username}
                </p>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Pop-up Story */}
        {selectedUserStories && (
          <Dialog
            open={!!selectedUserStories}
            onOpenChange={() => setSelectedUserStories(null)}
          >
            <DialogContent className="p-0 rounded-xl bg-white shadow-xl w-[480px] max-h-[80vh] overflow-hidden">
              <div className="relative">
                <img
                  src={selectedUserStories.stories[currentStoryIndex].imageUrl}
                  alt={selectedUserStories.stories[currentStoryIndex].caption}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                  }}
                />
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                  <div className="flex items-center space-x-2">
                    <img
                      src={selectedUserStories.user.profilePictureUrl}
                      alt={selectedUserStories.user.username}
                      className="w-8 h-8 rounded-full border-2 border-white"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
                      }}
                    />
                    <Link
                      href={`/profile/${selectedUserStories.user.id}`}
                      className="text-white font-medium hover:underline"
                    >
                      {selectedUserStories.user.username}
                    </Link>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-white">
                    {selectedUserStories.stories[currentStoryIndex].caption}
                  </p>
                </div>
                {/* Tombol Navigasi */}
                {currentStoryIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStoryNavigation("prev");
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}
                {currentStoryIndex < selectedUserStories.stories.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStoryNavigation("next");
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
                {/* Tombol Hapus (hanya untuk story milik sendiri) */}
                {selectedUserStories.stories[currentStoryIndex].user.id ===
                  "your-own-user-id" && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStory(
                        selectedUserStories.stories[currentStoryIndex].id,
                        selectedUserStories.user.id
                      );
                    }}
                    className="absolute top-2 right-2"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default StoryComponent;