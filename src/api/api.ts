import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const API_URL = "https://photo-sharing-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = "c7b411cc-0e7c-4ad1-aa3f-822b00e7734b";

// Konfigurasi axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    apiKey: API_KEY,
  },
});

// Interceptor untuk menyertakan token di header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Interceptor request error:", error);
    return Promise.reject(error);
  }
);


interface AuthData {
  email: string;
  password: string;
}

interface PostData {
  imageUrl: string;
  caption: string;
}

interface UpdateProfileData {
  name: string;
  email: string;
  password: string;
  profilePictureUrl: string;
  phoneNumber: string;
  bio: string;
  website: string;
}

// **Authentication**
export const register = (data: AuthData): Promise<AxiosResponse> =>
  axiosInstance.post("/register", data);
export const login = (data: AuthData): Promise<AxiosResponse> =>
  axiosInstance.post("/login", data);
export const logout = (): Promise<AxiosResponse> => axiosInstance.get("/logout");

// **User**
export const getLoggedUser = (): Promise<AxiosResponse> => axiosInstance.get("/user");
export const updateProfile = (data: UpdateProfileData): Promise<AxiosResponse> =>
  axiosInstance.post("/update-profile", data);
export const getUserProfile = (userId: string): Promise<AxiosResponse> =>
  axiosInstance.get(`/user/${userId}`);

// **Post**
export const createPost = (data: PostData): Promise<AxiosResponse> =>
  axiosInstance.post("/create-post", data);
export const updatePost = (id: string, data: Partial<PostData>): Promise<AxiosResponse> =>
  axiosInstance.post(`/update-post/${id}`, data);
export const deletePost = (postId: string): Promise<AxiosResponse> =>
  axiosInstance.delete(`/delete-post/${postId}`);
export const getExplorePosts = (size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get("/explore-post", { params: { size, page } });
export const getPostsByUserId = (userId: string, size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get(`/users-post/${userId}`, { params: { size, page } });
export const getPostById = (id: string): Promise<AxiosResponse> =>
  axiosInstance.get(`/post/${id}`);
export const getFollowingPosts = (size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get("/following-post", { params: { size, page } });

// **Follow**
export const followUser = (userIdFollow: string): Promise<AxiosResponse> =>
  axiosInstance.post("/follow", { userIdFollow });
export const unfollowUser = (userId: string): Promise<AxiosResponse> =>
  axiosInstance.post("/unfollow", { userId });
export const getMyFollowing = (size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get("/my-following", { params: { size, page } });
export const getMyFollower = (size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get("/my-follower", { params: { size, page } });
export const getFollowingByUserId = (userId: string, size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get(`/following/${userId}`, { params: { size, page } });
export const getFollowersByUserId = (userId: string, size: number = 100, page: number = 1,): Promise<AxiosResponse> =>
  axiosInstance.get(`/followers/${userId}`, { params: { size, page } });

// **Comment**
export const createComment = (postId: string, comment: string): Promise<AxiosResponse> =>
  axiosInstance.post("/create-comment", { postId, comment });
export const deleteComment = (commentId: string): Promise<AxiosResponse> =>
  axiosInstance.delete(`/delete-comment/${commentId}`);

// **Like**
export const likePost = (postId: string): Promise<AxiosResponse> =>
  axiosInstance.post("/like", { postId });
export const unlikePost = (postId: string): Promise<AxiosResponse> =>
  axiosInstance.post("/unlike", { postId });

// **Story**
export const createStory = (imageUrl: string, caption: string): Promise<AxiosResponse> =>
  axiosInstance.post("/create-story", { imageUrl, caption });
export const deleteStory = (storyId: string): Promise<AxiosResponse> =>
  axiosInstance.delete(`/delete-story/${storyId}`);
export const getStoryById = (storyId: string): Promise<AxiosResponse> =>
  axiosInstance.get(`/story/${storyId}`);
export const getViewsByStoryId = (storyId: string): Promise<AxiosResponse> =>
  axiosInstance.get(`/story-views/${storyId}`);
export const getMyFollowingStory = (size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get("/following-story", { params: { size, page } });
export const getMyStory = (size: number = 100, page: number = 1): Promise<AxiosResponse> =>
  axiosInstance.get("/my-story", { params: { size, page } });

// **Upload Image**
export const uploadImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  return axiosInstance.post("/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
