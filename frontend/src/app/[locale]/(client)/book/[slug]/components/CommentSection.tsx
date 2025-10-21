"use client";

import { useEffect, useState } from "react";
import { commentService } from "@/services/commentService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import Comment from "@/interfaces/Comment";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useSocket } from "@/app/hooks/useSocket";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const getAllReplies = (list: Comment[], parentId: string): Comment[] => {
  const direct = list.filter((c) => c.parentComment?._id === parentId);
  let all: Comment[] = [...direct];
  direct.forEach((c) => {
    all = all.concat(getAllReplies(list, c._id));
  });
  return all;
};

export default function CommentSection({ bookId }: { bookId: string }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [parent, setParent] = useState<Comment | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [dislikes, setDislikes] = useState<Record<string, number>>({});
  const socket = useSocket();

  useEffect(() => {
    if (!bookId || !socket) return;
    fetchComments();

    socket.emit("joinProductRoom", bookId);
    socket.on("commentCreated", fetchComments);
    socket.on("commentUpdated", fetchComments);
    socket.on("commentDeleted", fetchComments);

    return () => {
      socket.off("commentCreated");
      socket.off("commentUpdated");
      socket.off("commentDeleted");
      socket.emit("leaveRoom", bookId);
    };
  }, [bookId, socket]);

  const fetchComments = async () => {
    try {
      const data = await commentService.getByBook(bookId);
      setComments(data);
    } catch {
      toast.error("Không thể tải bình luận");
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return toast.warn("Vui lòng nhập nội dung");
    try {
      await commentService.create({
        user: user._id,
        bookId,
        content,
        parentComment: parent?._id,
      });
      setContent("");
      setParent(null);
    } catch {
      toast.error("Gửi bình luận thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bình luận này?")) return;
    try {
      await commentService.remove(id);
      toast.success("Đã xóa!");
    } catch {
      toast.error("Không thể xóa bình luận");
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return toast.warn("Nội dung trống!");
    try {
      await commentService.update(id, editContent);
      setEditing(null);
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleLike = (id: string) => {
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDislike = (id: string) => {
    setDislikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const sortedComments = () => {
    const topLevel = comments.filter((c) => !c.parentComment);
    return sortBy === "recent"
      ? topLevel.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : topLevel.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
  };

  const renderCommentsFlat = (list: Comment[]) => {
    return sortedComments().map((c) => {
      const descendants = getAllReplies(list, c._id);
      const isOpen = showReplies[c._id] || false;
      const likeCount = likes[c._id] || 0;
      const dislikeCount = dislikes[c._id] || 0;

      return (
        <div key={c._id} className="mb-6">
          {/* Comment cha */}
          <div className="flex gap-4">
            <img
              src={
                c.user?.avatar ||
                `https://ui-avatars.com/api/?name=${c.user?.name}&background=random`
              }
              alt={c.user?.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  {c.user?.name}
                </span>
                <span className="text-sm text-gray-500">
                  {dayjs(c.createdAt).fromNow()}
                </span>
              </div>

              {editing === c._id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(c._id)}
                      className="px-4 py-1.5 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-900 text-[15px] leading-relaxed mt-1">
                  {c.content}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => handleLike(c._id)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>

                <button
                  onClick={() => handleDislike(c._id)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span className="text-sm font-medium">{dislikeCount}</span>
                </button>

                <button
                  onClick={() => setParent(c)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Trả lời</span>
                </button>

                {user?._id === c.user?._id && (
                  <>
                    <button
                      onClick={() => {
                        setEditing(c._id);
                        setEditContent(c.content);
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <span className="text-sm font-medium">Chỉnh sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <span className="text-sm font-medium">Xóa</span>
                    </button>
                  </>
                )}

                <button className="ml-auto text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>

              {/* Replies */}
              {descendants.length > 0 && (
                <button
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
                  onClick={() =>
                    setShowReplies((prev) => ({
                      ...prev,
                      [c._id]: !prev[c._id],
                    }))
                  }
                >
                  {isOpen ? "↑ Ẩn trả lời" : `↓ ${descendants.length} trả lời`}
                </button>
              )}

              {isOpen && descendants.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                  {descendants.map((d) => {
                    const replyLikes = likes[d._id] || 0;
                    const replyDislikes = dislikes[d._id] || 0;

                    return (
                      <div key={d._id} className="flex gap-3">
                        <img
                          src={
                            d.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${d.user?.name}&background=random`
                          }
                          alt={d.user?.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">
                              {d.user?.name}
                            </span>
                            {d.user?.verified && (
                              <svg
                                className="w-3.5 h-3.5 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            <span className="text-xs text-gray-500">
                              {dayjs(d.createdAt).fromNow()}
                            </span>
                          </div>
                          <p className="text-gray-900 text-sm leading-relaxed">
                            {d.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => handleLike(d._id)}
                              className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              <span className="text-xs font-medium">
                                {replyLikes}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDislike(d._id)}
                              className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                              </svg>
                              <span className="text-xs font-medium">
                                {replyDislikes}
                              </span>
                            </button>
                            <button
                              onClick={() => setParent(d)}
                              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              <span className="text-xs font-medium">
                                Trả lời
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Bình luận</h2>
          <span className="px-2.5 py-0.5 bg-orange-600 text-white text-sm font-semibold rounded-full">
            {comments.filter((c) => !c.parentComment).length}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setSortBy(sortBy === "recent" ? "oldest" : "recent")}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            {sortBy === "recent" ? "Mới nhất" : "Cũ nhất"}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      {/* Comments List */}
      <div className="space-y-6">{renderCommentsFlat(comments)}</div>
      {/* Add Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        {parent && (
          <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
            <span>
              Đang trả lời <b>@{parent.user?.name}</b>
            </span>
            <button
              onClick={() => setParent(null)}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              ✕ Hủy
            </button>
          </div>
        )}

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}&background=random`
              }
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700">
              {user.name}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Thêm bình luận..."
            className="w-full p-4 pr-24 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex items-center justify-end mt-3">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-orange-600 text-white rounded-full text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
