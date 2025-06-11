import { useState, useEffect, useRef } from "react";
import { updateProfile, uploadImage, getLoggedUser } from "@/api/api";
import { useToast } from "@/components/ui/use-toast";

interface UserProfileData {
 name: string;
 email: string;
 username: string;
 password?: string;
 phoneNumber: string;
 bio: string;
 website: string;
 profilePictureUrl: string;
}


const UpdateProfile: React.FC = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserProfileData>({
    name: "",
    email: "",
    username: "",
    password: "",
    phoneNumber: "",
    bio: "",
    website: "",
    profilePictureUrl: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await getLoggedUser();
        if (response.data && response.data.data) {
          const userData = response.data.data;
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            username: userData.username || "",
            phoneNumber: userData.phoneNumber || "",
            bio: userData.bio || "",
            website: userData.website || "",
            profilePictureUrl: userData.profilePictureUrl || "/Portrait_Placeholder.png"
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Gagal memuat data profil.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    let finalProfilePictureUrl = formData.profilePictureUrl;

    try {
      if (selectedFile) {
        toast({ title: "Mengunggah", description: "Mengunggah gambar profil...", duration: 3000 });
        const uploadResponse = await uploadImage(selectedFile);
        finalProfilePictureUrl = uploadResponse.data.url;
        toast({ title: "Berhasil", description: "Gambar profil berhasil diunggah.", duration: 3000 });
      }


      const dataToUpdate: Partial<UserProfileData> = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        profilePictureUrl: finalProfilePictureUrl,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        website: formData.website
      };

      if (formData.password && formData.password.trim() !== "") {
        dataToUpdate.password = formData.password;
      }

      const response = await updateProfile(dataToUpdate);

      if (response.data.code === "200") {
        toast({
          title: "Sukses",
          description: "Profil berhasil diperbarui!",
          variant: "default",
        });
        setFormData(prev => ({ ...prev, password: "" }));
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Gagal memperbarui profil.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { id: "name", label: "Name", type: "text" },
    { id: "username", label: "Username", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "password", label: "Password", type: "password" },
    { id: "phoneNumber", label: "Phone Number", type: "text" },
    { id: "bio", label: "Bio", type: "textarea" },
    { id: "website", label: "Website", type: "text" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-black mb-4">Edit Profile</h2>

      <div className="space-y-2">
        <label htmlFor="profilePictureFile" className="block text-sm font-medium capitalize text-black">
          Profile Picture
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
            {selectedFile ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={formData.profilePictureUrl || "/Portrait_Placeholder.png"}
                alt="Current Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/Portrait_Placeholder.png"; }}
              />
            )}
          </div>
          <div>
            <input
              type="file"
              id="profilePictureFile"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {formFields.map((field) => (
        <div className="space-y-2" key={field.id}>
          <label htmlFor={field.id} className="block text-sm font-medium capitalize text-black">
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={field.id}
              value={formData[field.id as keyof UserProfileData] as string}
              onChange={handleChange}
              className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
              disabled={loading}
            />
          ) : (
            <input
              type={field.type}
              id={field.id}
              value={field.id === "password" ? (formData.password || "") : (formData[field.id as keyof UserProfileData] as string)}
              onChange={handleChange}
              placeholder={field.id === "password" ? "Kosongkan jika tidak diubah" : ""}
              className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
              disabled={loading}
            />
          )}
        </div>
      ))}

      {loading && <div className="mt-4 text-center text-black">Updating profile...</div>}

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
};

export default UpdateProfile;