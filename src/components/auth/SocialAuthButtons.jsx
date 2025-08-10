import { FaGoogle, FaGithub } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { useState } from "react";

const providers = [
  {
    name: "Google",
    icon: FaGoogle,
    color: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    providerId: "google"
  },
  {
    name: "GitHub",
    icon: FaGithub,
    color: "bg-gray-800 hover:bg-gray-900 focus:ring-gray-700",
    providerId: "github"
  }
];

export default function SocialAuthButtons() {
  const { socialLogin } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleSocialLogin = async (provider) => {
    try {
      setLoadingProvider(provider);
      await socialLogin(provider);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map(({ name, icon: Icon, color, providerId }) => (
        <div key={name}>
          <button
            onClick={() => handleSocialLogin(providerId)}
            disabled={!!loadingProvider}
            className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white ${color} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-75`}
            aria-label={`Sign in with ${name}`}
          >
            {loadingProvider === providerId ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <Icon className="h-5 w-5" />
                <span className="sr-only">{name}</span>
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}