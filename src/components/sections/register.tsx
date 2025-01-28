import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordRepeat: string;
  phoneNumber: string;
  bio: string;
  website: string;
}

interface Props {
  onRegister: (data: RegisterData) => void;
}

const RegisterComponent: React.FC<Props> = ({ onRegister }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const data = {
        name,
        username,
        email,
        password,
        passwordRepeat,
        phoneNumber,
        bio,
        website,
      };
      await onRegister(data);
      setMessage("Register successful");
      setError(null);
    } catch (err) {
      console.error("Register error:", err);
      setError("Register failed. Please check your credentials.");
    }
  };

  return (
    <div className="w-screen h-[100vh] flex flex-col justify-center items-center bg-gray-50">
      <div className="p-6 glassmorphism bg-opacity-10 rounded-lg shadow-md w-96">
        <h1 className="mb-4 text-2xl font-bold text-center text-gray-900">
          Register
        </h1>
        {error && <Alert variant="destructive">{error}</Alert>}
        {message && <Alert variant="default">{message}</Alert>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Name
            </label>
            <Input
              className="text-black"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <Input
              className="text-black"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Email
            </label>
            <Input
              className="text-black"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <Input
              className="text-black"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Repeat Password
            </label>
            <Input
              className="text-black"
              type="password"
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Phone Number
            </label>
            <Input
              className="text-black"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Bio
            </label>
            <Input
              className="text-black"
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Website
            </label>
            <Input
              className="text-black"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gray-900 hover:bg-slate-500 hover:text-gray-900 text-white font-bold"
          >
            Register
          </Button>
        </form>
        <p className="mt-4 text-gray-900">
          Already have an account?{" "}
          <a
            href="/login"
            className="underline underline-offset-4 text-gray-900 hover:text-slate-500 font-bold"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterComponent;
