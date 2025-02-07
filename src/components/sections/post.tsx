import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage, createPost } from "@/api/api";
import { useToast } from "@/components/ui/use-toast";

const ImageUploadPost = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(""); // Reset URL jika user memilih file
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
    setSelectedFile(null); // Reset file jika user memasukkan URL
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!selectedFile && !imageUrl.trim()) {
        throw new Error("Please select an image file or enter an image URL");
      }

      if (!caption.trim()) {
        throw new Error("Please enter a caption");
      }

      let finalImageUrl = imageUrl.trim();
      if (selectedFile) {
        const uploadResponse = await uploadImage(selectedFile);
        finalImageUrl = uploadResponse.data.url;
      }

      await createPost({
        imageUrl: finalImageUrl,
        caption: caption.trim(),
      });
      toast({
        description: "Post created successfully!",
        variant: "default" });
      setCaption("");
      setSelectedFile(null);
      setImageUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast({
        description: (err as Error).message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="w-full"
              disabled={loading || !!imageUrl}
            />
          </div>

          <div>
            <Input
              type="text"
              placeholder="Or enter image URL..."
              value={imageUrl}
              onChange={handleUrlChange}
              className="w-full"
              disabled={loading || !!selectedFile}
            />
          </div>

          <div>
            <Textarea
              placeholder="Enter your caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Post..." : "Create Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ImageUploadPost;
