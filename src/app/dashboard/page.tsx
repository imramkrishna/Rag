"use client";

import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UploadedFile = {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  alias: string | null;
  createdAt: string;
};

type Tab = "chat" | "upload" | "files" | "profile";

const tabs: { id: Tab; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  {
    id: "chat",
    label: "Chat",
    shortLabel: "Chat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: "upload",
    label: "Upload",
    shortLabel: "Upload",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    id: "files",
    label: "Files",
    shortLabel: "Files",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    shortLabel: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alias, setAlias] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadUploadedFiles = async () => {
    setLoadingFiles(true);

    try {
      const response = await fetch("/api/upload", {
        method: "GET",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Failed to load files");
      }

      setUploadedFiles(data.files || []);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let active = true;

    const fetchUploadedFiles = async () => {
      setLoadingFiles(true);

      try {
        const response = await fetch("/api/upload", {
          method: "GET",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || data?.message || "Failed to load files");
        }

        if (active) {
          setUploadedFiles(data.files || []);
        }
      } catch (error) {
        if (active) {
          setUploadError(error instanceof Error ? error.message : "Failed to load files");
        }
      } finally {
        if (active) {
          setLoadingFiles(false);
        }
      }
    };

    void fetchUploadedFiles();

    return () => {
      active = false;
    };
  }, [session]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
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
      formData.append("alias", alias);

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
      setAlias("");
      event.currentTarget.reset();
      await loadUploadedFiles();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center py-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{session.user.name || "User"}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{session.user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Account Info</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-300">User ID</dt>
              <dd className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-[150px] text-right">{session.user.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-300">Email Verified</dt>
              <dd className="text-gray-900 dark:text-white">{session.user.emailVerified ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-300">Member Since</dt>
              <dd className="text-gray-900 dark:text-white">{new Date(session.user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Chat Profile</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-300">Display Name</dt>
              <dd className="text-gray-900 dark:text-white">{session.user.name || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-300">Chat Alias</dt>
              <dd className="text-gray-900 dark:text-white font-mono text-sm">{session.user.email.split("@")[0]}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-300">Storage Owner</dt>
              <dd className="font-mono text-sm text-gray-900 dark:text-white truncate max-w-[150px] text-right">{session.user.id}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="text-left p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">Upload File</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add documents to chat</p>
          </button>
          <button className="text-left p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">Manage Files</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View uploaded documents</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUploadTab = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload File</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Upload a document and give it an alias for easy reference in chat.</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alias Name
          </label>
          <input
            id="alias"
            type="text"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            placeholder="Invoice 2026, research note, client brief..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A friendly name to identify this file in chat</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File
          </label>
          <div className="relative">
            <input
              type="file"
              id="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              file
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-400"
            }`}>
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">Drag & drop a file here, or click to select</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">PDF, TXT, JPG, PNG up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="submit"
            disabled={uploading || !file}
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>

          {uploadedUrl ? (
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View uploaded file →
            </a>
          ) : null}
        </div>

        {uploadError ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
          </div>
        ) : null}

        {uploadedUrl ? (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <p className="text-sm text-green-700 dark:text-green-300">Uploaded successfully!</p>
          </div>
        ) : null}
      </form>
    </div>
  );

  const renderFilesTab = () => (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Uploaded Files</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Documents available for chat context</p>
        </div>
        <button
          type="button"
          onClick={loadUploadedFiles}
          disabled={loadingFiles}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loadingFiles ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loadingFiles ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading files...</p>
        </div>
      ) : uploadedFiles.length ? (
        <div className="space-y-3">
          {uploadedFiles.map((uploadedFile) => (
            <a
              key={uploadedFile.id}
              href={uploadedFile.filePath}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{uploadedFile.alias || uploadedFile.fileName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{uploadedFile.fileName} • {uploadedFile.fileType || "unknown"}</p>
              </div>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No files yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Upload a document to get started</p>
          <button
            onClick={() => setActiveTab("upload")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload File
          </button>
        </div>
      )}
    </div>
  );

  const renderChatTab = () => (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Ask questions about your uploaded documents</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Start a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400">Upload files first, then ask questions about them</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                message.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-md shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-gray-100 dark:bg-gray-800 rounded-bl-md shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!chatInput.trim() || chatLoading) return;
          const userMessage = chatInput.trim();
          setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
          setChatInput("");
          setChatLoading(true);

          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `I received: "${userMessage}". This is a demo response. Connect your AI backend to process messages with document context.` },
            ]);
            setChatLoading(false);
          }, 1000);
        }}
        className="relative"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about your documents..."
            disabled={chatLoading}
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="rounded-xl bg-indigo-600 px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400 disabled:opacity-50 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">Press Enter to send • Demo mode - connect AI backend for real responses</p>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors lg:hidden"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">RAG Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:relative z-50 h-full lg:h-auto transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-16" : "w-64"
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
          aria-label="Sidebar navigation"
        >
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
                title={sidebarCollapsed ? tab.label : undefined}
              >
                <span className="flex-shrink-0" aria-hidden="true">
                  {tab.icon}
                </span>
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.user.name || "User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto lg:overflow-visible">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {activeTab === "chat" && (
                <div id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" className="h-[calc(100vh-200px)] min-h-[500px]">
                  {renderChatTab()}
                </div>
              )}

              {activeTab === "upload" && (
                <div id="upload-panel" role="tabpanel" aria-labelledby="upload-tab" className="p-6 lg:p-8">
                  {renderUploadTab()}
                </div>
              )}

              {activeTab === "files" && (
                <div id="files-panel" role="tabpanel" aria-labelledby="files-tab" className="p-6 lg:p-8">
                  {renderFilesTab()}
                </div>
              )}

              {activeTab === "profile" && (
                <div id="profile-panel" role="tabpanel" aria-labelledby="profile-tab" className="p-6 lg:p-8">
                  {renderProfileTab()}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}