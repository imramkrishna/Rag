"use client";

import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError("");
    setUploadedUrl("");

    if (!file) {
      setUploadError("Please choose a file first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Upload failed");
      }

      setUploadedUrl(data.url || "");
      setFile(null);
      event.currentTarget.reset();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to your Dashboard
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Profile Information
              </h3>
              <dl className="space-y-2 text-gray-600 dark:text-gray-300">
                <div>
                  <dt className="font-medium">Name:</dt>
                  <dd>{session.user.name || "Not set"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Email:</dt>
                  <dd>{session.user.email}</dd>
                </div>
                <div>
                  <dt className="font-medium">User ID:</dt>
                  <dd className="font-mono text-sm">{session.user.id}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Account Status
              </h3>
              <dl className="space-y-2 text-gray-600 dark:text-gray-300">
                <div>
                  <dt className="font-medium">Status:</dt>
                  <dd className="text-green-600 dark:text-green-400">Active</dd>
                </div>
                <div>
                  <dt className="font-medium">Email Verified:</dt>
                  <dd>{session.user.emailVerified ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Created:</dt>
                  <dd>{new Date(session.user.createdAt).toLocaleDateString("en-US")}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Update Profile
                </button>
                <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                  Change Password
                </button>
                <button className="w-full px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload file
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Upload a file and give it an alias that the backend can read from the same form submission.
              </p>
            </div>

            <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-2">

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  File
                </span>
                <input
                  type="file"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                />
              </label>

              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                  {uploading ? "Uploading..." : "Upload file"}
                </button>

                {uploadedUrl ? (
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View uploaded file
                  </a>
                ) : null}
              </div>

              {uploadError ? (
                <p className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {uploadError}
                </p>
              ) : null}

              {uploadedUrl ? (
                <p className="md:col-span-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                  Uploaded successfully.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}