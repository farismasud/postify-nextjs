import ProfileComponent from "@/components/sections/profile";
import { useRouter } from "next/router";

const Profile = () => {
  const router = useRouter();
  const userId = router.query.id;

  if (!userId) {
    return <div>User ID is required</div>;
  }

  return (
    <div>
      <ProfileComponent />
    </div>
  );
};

export default Profile;