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
  imageUrl: string; // Tambahkan imageUrl untuk post
  caption: string; // Tambahkan caption
  // image: File; // Tidak diperlukan di sini
}

// Fungsi untuk register user
export const register = (data: AuthData): Promise<AxiosResponse> =>
  axiosInstance.post("/register", data);

// Fungsi untuk login
export const login = (data: AuthData): Promise<AxiosResponse> =>
  axiosInstance.post("/login", data);

// Fungsi untuk logout
export const logout = (): Promise<AxiosResponse> =>
  axiosInstance.get("/logout");

// Fungsi untuk upload gambar
export const uploadImage = (file: File): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append("image", file);

  return axiosInstance.post("/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Fungsi untuk membuat post baru
export const createPost = (data: PostData): Promise<AxiosResponse> =>
  axiosInstance.post("/create-post", data);

// Fungsi untuk meng-update post berdasarkan ID
export const updatePost = (
  id: string,
  data: Partial<PostData>
): Promise<AxiosResponse> => axiosInstance.post(`/update-post/${id}`, data);

// Fungsi untuk mendapatkan semua post
export const getExplorePosts = (
  size: number = 10,
  page: number = 1
): Promise<AxiosResponse> =>
  axiosInstance.get("/explore-post", { params: { size, page } });

  // Fungsi untuk mendapatkan postingan dari pengguna yang diikuti
export const getFollowingPosts = (
  size: number = 10,
  page: number = 1
): Promise<AxiosResponse> =>
  axiosInstance.get("/following-post", {
    params: { size, page },
  });

// Fungsi untuk mendapatkan post berdasarkan ID
export const getPostById = (id: string): Promise<AxiosResponse> =>
  axiosInstance.get(`/post/${id}`);

// Fungsi untuk mendapatkan post berdasarkan user ID
export const getPostsByUserId = (
  userId: string,
  size: number = 10,
  page: number = 1
): Promise<AxiosResponse> =>
  axiosInstance.get(`/users-post/${userId}`, {
    params: { size, page },
  });

// Fungsi untuk mendapatkan followers berdasarkan user ID
export const getFollowersByUserId = (
  userId: string,
  size: number = 10,
  page: number = 1
): Promise<AxiosResponse> =>
  axiosInstance.get(`/followers/${userId}`, {
    params: { size, page },
  });

// Fungsi untuk mendapatkan following berdasarkan user ID
export const getFollowingByUserId = (
  userId: string,
  size: number = 10,
  page: number = 1
): Promise<AxiosResponse> =>
  axiosInstance.get(`/following/${userId}`, {
    params: { size, page },
  });

// Fungsi untuk mendapatkan profil user berdasarkan user ID
export const getUserProfile = (userId: string): Promise<AxiosResponse> =>
  axiosInstance.get(`/user/${userId}`);

// Fungsi untuk mendapatkan data pengguna yang sedang login
export const getLoggedUser = (): Promise<AxiosResponse> =>
  axiosInstance.get("/user"); // Endpoint untuk mendapatkan profil pengguna saat ini

// Fungsi untuk membuat komentar
export const createComment = (
  postId: string,
  comment: string
): Promise<AxiosResponse> => {
  const data = {
    postId: postId,
    comment: comment,
  };
  return axiosInstance.post("/create-comment", data);
};

// Fungsi untuk menghapus komentar berdasarkan ID
export const deleteComment = (commentId: string): Promise<AxiosResponse> => {
  return axiosInstance.delete(`/delete-comment/${commentId}`);
};

// Fungsi untuk menyukai post
export const likePost = (postId: string): Promise<AxiosResponse> => {
  const data = {
    postId: postId,
  };
  return axiosInstance.post("/like", data);
};

// Fungsi untuk menghapus like dari post
export const unlikePost = (postId: string): Promise<AxiosResponse> => {
  const data = {
    postId: postId,
  };
  return axiosInstance.post("/unlike", data);
};

// Fungsi untuk Story
export const createStory = (
  imageUrl: string,
  caption: string
): Promise<AxiosResponse> => {
  const data = {
    imageUrl: imageUrl,
    caption: caption,
  }
  return axiosInstance.post("/create-story", data);
};

// Fungsi untuk Menghapus Story
export const deleteStory = (storyId: string): Promise<AxiosResponse> => {
  return axiosInstance.delete(`/delete-story/${storyId}`);
};

// Fungsi untuk mendapatkan story by id
export const getStoryById = (storyId: string): Promise<AxiosResponse> => {
  return axiosInstance.get(`/story/${storyId}`);
};

// fungsi untuk views by story id
export const getViewsByStoryId = (storyId: string): Promise<AxiosResponse> => {
  return axiosInstance.get(`/story-views/${storyId}`);
};

// fungsi untuk my following story dengan pagination
export const getMyFollowingStory = (
  size: number = 10,
  page: number = 1
): Promise<AxiosResponse> => {
  return axiosInstance.get("/following-story", {
    params: { size, page },
  });
};


// 6 api lagi nanti :)) cape