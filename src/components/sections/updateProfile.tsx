import { useState } from "react";
import { updateProfile } from "@/api/api";

const UpdateProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profilePictureUrl: "",
    phoneNumber: "",
    bio: "",
    website: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await updateProfile(formData);
      if (response.data.code === "200") {
        setSuccess("Profile updated successfully!");
      } else {
        setError(response.data.message);
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.keys(formData).map((key) => (
        <div className="space-y-2" key={key}>
          <label htmlFor={key} className="block text-sm font-medium capitalize text-black">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </label>
          {key === "bio" ? (
            <textarea
              id={key}
              value={formData[key as keyof typeof formData]}
              onChange={handleChange}
              className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          ) : (
            <input
              type={key === "password" ? "password" : "text"}
              id={key}
              value={formData[key as keyof typeof formData]}
              onChange={handleChange}
              className="block w-full px-4 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
          )}
        </div>
      ))}

      {error && <div className="mt-4 text-red-500 text-black">{error}</div>}
      {success && <div className="mt-4 text-green-500 text-black">{success}</div>}

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Profile
        </button>
      </div>
    </form>
  );
};

export default UpdateProfile;
