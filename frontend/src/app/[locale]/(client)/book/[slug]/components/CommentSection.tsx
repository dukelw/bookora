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
import ConfirmModal from "@/components/modal/ConfirmModal";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function CommentSection({ bookId }: { bookId: string }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]); // top-level only (loaded pages)
  const [totalTopLevel, setTotalTopLevel] = useState<number>(0); // TOTAL top-level count from server
  const [page, setPage] = useState(1);
  const limit = 5;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [content, setContent] = useState("");
  const [parent, setParent] = useState<Comment | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [repliesMap, setRepliesMap] = useState<Record<string, Comment[]>>({});
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [dislikes, setDislikes] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!bookId || !socket) return;
    resetAndFetch();

    socket.emit("joinProductRoom", bookId);
    socket.on("commentCreated", resetAndFetch);
    socket.on("commentUpdated", resetAndFetch);
    socket.on("commentDeleted", resetAndFetch);

    return () => {
      socket.off("commentCreated");
      socket.off("commentUpdated");
      socket.off("commentDeleted");
      socket.emit("leaveRoom", bookId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, socket]);

  const resetAndFetch = async () => {
    setPage(1);
    setRepliesMap({});
    setComments([]);
    setHasMore(true);
    setTotalTopLevel(0);
    await fetchComments(1, true);
  };

  const fetchComments = async (pageToFetch = 1, replace = false) => {
    try {
      if (pageToFetch !== 1) setLoadingMore(true);
      const data = await commentService.getByBook(bookId, pageToFetch, limit);
      // data: { comments, total, hasMore, page, limit }
      if (replace) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }
      setHasMore(Boolean(data.hasMore));
      setPage(pageToFetch);
      setTotalTopLevel(Number(data.total || 0));

      // AUTO-PREFETCH replies for the newly loaded top-level comments
      // Only prefetch for the comments returned by this request (data.comments)
      if (Array.isArray(data.comments) && data.comments.length > 0) {
        // map over comments and fetch replies in parallel; use allSettled to avoid failing whole batch
        const fetches = data.comments.map((c: Comment) =>
          commentService.getReplies(bookId, c._id).then(
            (res) => ({ id: c._id, replies: Array.isArray(res) ? res : [] }),
            (err) => {
              console.error(`Failed to fetch replies for ${c._id}`, err);
              return { id: c._id, replies: [] };
            }
          )
        );

        const settled = await Promise.all(fetches);
        // build a map of replies for these comments
        setRepliesMap((prev) => {
          const next = { ...prev };
          settled.forEach((r: any) => {
            if (r && r.id) next[r.id] = r.replies;
          });
          return next;
        });
      }
    } catch (err) {
      console.error("fetchComments error:", err);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore) return;
    await fetchComments(page + 1);
  };

  // kept for on-demand refresh of replies if needed
  const fetchReplies = async (parentId: string) => {
    // nếu đã load replies rồi thì không fetch lại
    if (repliesMap[parentId]) return;
    try {
      const data = await commentService.getReplies(bookId, parentId);
      setRepliesMap((prev) => ({
        ...prev,
        [parentId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("fetchReplies error:", err);
      toast.error("Không thể tải trả lời");
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return toast.warn("Vui lòng nhập nội dung");
    try {
      await commentService.create({
        user: user ? user._id : null,
        bookId,
        content,
        parentComment: parent?._id,
      });
      setContent("");
      setParent(null);
      // server emits socket -> resetAndFetch will refresh lists
    } catch (err) {
      console.error("create comment error", err);
      toast.error("Gửi bình luận thất bại");
    }
  };

  const openDeleteConfirm = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!toDeleteId) {
      setConfirmOpen(false);
      return;
    }
    try {
      await commentService.remove(toDeleteId);
      toast.success("Đã xóa!");
      setConfirmOpen(false);
      setToDeleteId(null);
      // refresh list (server emits might also trigger resetAndFetch)
      await resetAndFetch();
    } catch (err) {
      console.error("delete comment error", err);
      toast.error("Không thể xóa bình luận");
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return toast.warn("Nội dung trống!");
    try {
      await commentService.update(id, editContent);
      setEditing(null);
    } catch (err) {
      console.error("update comment error", err);
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
    const copy = [...comments];
    return sortBy === "recent"
      ? copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ConfirmModal
        show={confirmOpen}
        title="Xóa bình luận"
        message="Bạn có chắc muốn xóa bình luận này? Hành động không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setConfirmOpen(false);
          setToDeleteId(null);
        }}
      />
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Bình luận</h2>
          {/* Show TOTAL top-level comments from server */}
          <span className="px-2.5 py-0.5 bg-orange-600 text-white text-sm font-semibold rounded-full">
            {totalTopLevel}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setSortBy(sortBy === "recent" ? "oldest" : "recent")}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {sortBy === "recent" ? "Mới nhất" : "Cũ nhất"}
          </button>
        </div>
      </div>

      {/* Comments List (top-level) */}
      <div className="space-y-6">
        {sortedComments().map((c) => {
          const isOpen = showReplies[c._id] || false;
          const childReplies = repliesMap[c._id] || [];
          const likeCount = likes[c._id] || 0;
          const dislikeCount = dislikes[c._id] || 0;

          return (
            <div key={c._id} className="mb-6">
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
                      {c.user?.name || "Bookholic"}
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
                      <span className="text-sm font-medium">
                        {dislikeCount}
                      </span>
                    </button>

                    <button
                      onClick={async () => {
                        setParent(c);
                      }}
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
                          onClick={() => openDeleteConfirm(c._id)}
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

                  {/* Replies toggle */}
                  <div className="mt-2">
                    {childReplies.length > 0 && (
                      <button
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
                        onClick={async () => {
                          const newOpen = !isOpen;
                          setShowReplies((prev) => ({
                            ...prev,
                            [c._id]: newOpen,
                          }));
                          // fetchReplies is no-op if already prefetched
                          if (newOpen && !repliesMap[c._id]) {
                            await fetchReplies(c._id);
                          }
                        }}
                      >
                        {isOpen
                          ? "↑ Ẩn trả lời"
                          : `↓ ${childReplies.length} trả lời`}
                      </button>
                    )}
                    {isOpen && childReplies && childReplies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                        {childReplies.map((d) => {
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
                                    {d.user?.name || "Bookholic"}
                                  </span>
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
                                    <span className="text-xs font-medium">
                                      {replyLikes}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleDislike(d._id)}
                                    className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                                  >
                                    <span className="text-xs font-medium">
                                      {replyDislikes}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => setParent(d)}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                                  >
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
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      <div className="flex justify-center mt-4">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        ) : (
          <div className="text-sm text-gray-500">Đã hết bình luận</div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 mt-6">
        {parent && (
          <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
            <span>
              Đang trả lời <b>@{parent.user?.name || "Bookholic"}</b>
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
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}&background=random`
              }
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700">
              {user?.name || "Bookholic"}
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
