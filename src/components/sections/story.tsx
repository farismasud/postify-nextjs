import { useEffect, useState, useRef } from "react";
import {
  getMyFollowingStory,
  getMyStory,
  createStory,
  deleteStory,
  uploadImage,
  getLoggedUser,
} from "@/api/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  const [newStoryFile, setNewStoryFile] = useState<File | null>(null);
  const [newStoryCaption, setNewStoryCaption] = useState("");
  const [isCreateStoryDialogOpen, setIsCreateStoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCurrentUserId();
    fetchStories();
  }, []);

  const fetchCurrentUserId = async () => {
    try {
      const response = await getLoggedUser();
      if (response.data && response.data.data && response.data.data.id) {
        setCurrentUserId(response.data.data.id);
      }
    } catch (error) {
      console.error("Failed to fetch current user ID:", error);
      toast({
        title: "Error",
        description: "Gagal memuat info pengguna. Silakan login ulang.",
        variant: "destructive",
      });
    }
  };

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

      const userStoriesArray: UserStories[] = (Object.values(groupedStories) as UserStories[]).sort((a, b) => {
        if (currentUserId) {
          if (a.user.id === currentUserId) return -1;
          if (b.user.id === currentUserId) return 1;
        }
        return a.user.username.localeCompare(b.user.username);
      });

      setUserStories(userStoriesArray);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal mengambil story.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewStoryFile(file);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryFile) {
      toast({
        title: "Peringatan",
        description: "Silakan pilih file gambar untuk story Anda.",
        variant: "destructive",
      });
      return;
    }
    if (!newStoryCaption.trim()) {
      toast({
        title: "Peringatan",
        description: "Silakan masukkan caption untuk story Anda.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingStory(true);
      const uploadResponse = await uploadImage(newStoryFile);
      const imageUrl = uploadResponse.data.url; // Asumsi API Anda mengembalikan URL gambar yang diunggah di response.data.url

      // Buat story dengan URL yang didapat
      const response = await createStory(imageUrl, newStoryCaption.trim());
      const createdStory = response.data.data;

      if (!createdStory || !createdStory.id) {
        throw new Error("ID Story tidak ada di respons API.");
      }

      // Perbarui state userStories
      setUserStories((prev) => {
        const updated = [...prev];
        const storyOwnerId = createdStory.user.id;
        const userIndex = updated.findIndex((us) => us.user.id === storyOwnerId);

        if (userIndex >= 0) {
          // Jika pengguna sudah ada, tambahkan story baru ke daftar mereka
          updated[userIndex].stories.push(createdStory);
        } else {
          // Jika pengguna (misalnya, diri sendiri) belum ada di daftar stories yang difollow
          // Tambahkan pengguna ini dengan story barunya di bagian depan (paling kiri)
          updated.unshift({
            user: createdStory.user,
            stories: [createdStory],
          });
        }
        return updated;
      });

      // Reset form
      setNewStoryFile(null);
      setNewStoryCaption("");
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input file
      }
      setIsCreateStoryDialogOpen(false); // Tutup dialog
      toast({ title: "Sukses", description: "Story berhasil dibuat!" });
    } catch (err: any) {
      console.error("Error creating story:", err);
    } finally {
      setIsCreatingStory(false); // Nonaktifkan loading khusus
    }
  };

  const handleDeleteStory = async (storyId: string, userId: string) => {
    if (!currentUserId) {
      toast({ title: "Error", description: "Tidak dapat menghapus story. ID pengguna tidak ditemukan." });
      return;
    }
    if (userId !== currentUserId) {
      toast({ title: "Peringatan", description: "Anda hanya dapat menghapus story Anda sendiri." });
      return;
    }

    try {
      await deleteStory(storyId);
      setUserStories((prev) => {
        const updatedUserStories = prev
          .map((us) =>
            us.user.id === userId
              ? { ...us, stories: us.stories.filter((s) => s.id !== storyId) }
              : us
          )
          .filter((us) => us.stories.length > 0); // Hapus grup user jika tidak ada story lagi

        // Jika story yang dihapus adalah story terakhir dari user yang sedang dipilih, tutup dialog
        if (
          selectedUserStories &&
          selectedUserStories.user.id === userId &&
          selectedUserStories.stories.length === 1 // Hanya 1 story tersisa yang akan dihapus
        ) {
          setSelectedUserStories(null); // Tutup dialog story viewer
        } else if (selectedUserStories && selectedUserStories.user.id === userId) {
          // Jika ada story lain di dalam grup yang sedang dilihat
          const newSelectedStories = selectedUserStories.stories.filter(s => s.id !== storyId);
          if (newSelectedStories.length > 0) {
            // Pindah ke story berikutnya atau sebelumnya jika story saat ini dihapus
            setCurrentStoryIndex(Math.min(currentStoryIndex, newSelectedStories.length - 1));
            setSelectedUserStories({ ...selectedUserStories, stories: newSelectedStories });
          } else {
            // Jika ini story terakhir di grup yang sedang dilihat, tutup dialog
            setSelectedUserStories(null);
          }
        }
        return updatedUserStories;
      });
      toast({ title: "Sukses", description: "Story berhasil dihapus!" });
    } catch (err: any) {
      console.error("Error deleting story:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Gagal menghapus story.",
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
    setCurrentStoryIndex(0); // Selalu mulai dari story pertama saat user baru diklik
  };

  // Logika untuk menampilkan loading indicator pada StoryComponent itu sendiri
  if (loading && userStories.length === 0) {
    return (
        <div className="p-4 md:p-6 flex justify-center items-center h-24 bg-white rounded-lg shadow-lg"> {/* Disesuaikan agar sesuai tema */}
            Memuat story...
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-zinc-800 rounded-lg"> {/* Adjusted padding */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4 md:p-6"> {/* Adjusted padding */}
        <ScrollArea className="w-full pb-4">
          <div className="flex gap-4">
            {/* Tombol Buat Story */}
            <Dialog open={isCreateStoryDialogOpen} onOpenChange={setIsCreateStoryDialogOpen}>
              <DialogTrigger asChild>
                <button className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Plus size={24} className="text-blue-500" />
                  <span className="text-xs text-blue-500 mt-1 text-center">New Story</span>
                </button>
              </DialogTrigger>
              <DialogContent className="p-6 rounded-xl bg-white shadow-xl w-96 max-w-[90vw]">
                <DialogTitle className="text-lg font-semibold text-gray-800">
                  Create Story
                </DialogTitle>
                <DialogDescription>
                  Pilih file gambar dan tulis caption untuk story Anda.
                </DialogDescription>
                <form onSubmit={handleCreateStory} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pilih Gambar
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="w-full p-3 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        disabled={isCreatingStory} // Gunakan loading khusus
                      />
                      {/* Tampilkan preview gambar yang dipilih */}
                      {newStoryFile && (
                        <img
                          src={URL.createObjectURL(newStoryFile)}
                          alt="Preview"
                          className="mt-2 w-full max-h-40 object-contain rounded-md"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Caption
                    </label>
                    <textarea
                      value={newStoryCaption}
                      onChange={(e) => setNewStoryCaption(e.target.value)}
                      placeholder="Tulis caption..."
                      className="w-full p-3 border rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black outline-none"
                      disabled={isCreatingStory} // Gunakan loading khusus
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreatingStory} // Gunakan loading khusus
                    variant="default"
                    className="w-full shadow-md hover:shadow-lg font-medium transition-colors"
                  >
                    {isCreatingStory ? "Membuat..." : "Buat Story"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Lingkaran Story per Akun */}
            {userStories.map((userStory) => (
              <div
                key={userStory.user.id}
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => handleUserClick(userStory)}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500">
                  <img
                    src={userStory.user.profilePictureUrl || "/Portrait_Placeholder.png"}
                    alt={userStory.user.username}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/Portrait_Placeholder.png";
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

        {/* Pop-up Story Viewer */}
        {selectedUserStories && (
          <Dialog
            open={!!selectedUserStories}
            onOpenChange={() => setSelectedUserStories(null)}
          >
            <DialogContent className="p-0 rounded-xl bg-white shadow-xl w-[480px] max-w-[95vw] max-h-[90vh] overflow-hidden">
              <div className="relative w-full h-full flex flex-col justify-between">
                {/* Story Image */}
                <img
                  src={selectedUserStories.stories[currentStoryIndex].imageUrl || "/Portrait_Placeholder.png"}
                  alt={selectedUserStories.stories[currentStoryIndex].caption}
                  className="w-full h-full object-contain bg-black"
                  onError={(e) => {
                    e.currentTarget.src = "/Portrait_Placeholder.png";
                  }}
                />

                {/* Info Pengguna & Link Profil */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                  <div className="flex items-center space-x-2">
                    <img
                      src={selectedUserStories.user.profilePictureUrl || "/Portrait_Placeholder.png"}
                      alt={selectedUserStories.user.username}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/Portrait_Placeholder.png";
                      }}
                    />
                    <Link
                      href={`/profile/${selectedUserStories.user.id}`}
                      className="text-white font-medium hover:underline"
                      onClick={() => setSelectedUserStories(null)}
                    >
                      {selectedUserStories.user.username}
                    </Link>
                  </div>
                </div>

                {/* Caption Story */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-white text-sm">
                    {selectedUserStories.stories[currentStoryIndex].caption}
                  </p>
                </div>

                {/* Tombol Navigasi Prev/Next */}
                <div className="absolute inset-0 flex justify-between items-center px-2">
                    {currentStoryIndex > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStoryNavigation("prev");
                        }}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
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
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white"
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
                </div>


                {/* Tombol Hapus (hanya untuk story milik sendiri) */}
                {currentUserId && selectedUserStories.stories[currentStoryIndex].user.id === currentUserId && (
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
                    className="absolute top-2 right-2 rounded-full z-10"
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