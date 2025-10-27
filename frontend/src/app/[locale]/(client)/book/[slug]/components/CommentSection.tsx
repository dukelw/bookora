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
import AllCommentsModal from "./AllCommentsModal";
import CommentItem from "./comment/CommentItem";
import ReplyList from "./comment/ReplyList";
import { useTranslations } from "use-intl";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export default function CommentSection({ bookId }: { bookId: string }) {
  const { user } = useAuthStore();
  const socket = useSocket();
  const [comments, setComments] = useState<Comment[]>([]);
  const [repliesMap, setRepliesMap] = useState<Record<string, Comment[]>>({});
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [totalTopLevel, setTotalTopLevel] = useState<number>(0);
  const [page, setPage] = useState(1);
  const limit = 2;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [content, setContent] = useState("");
  const [parent, setParent] = useState<Comment | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  const t = useTranslations("comment");
  
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

      setComments((prev) =>
        replace ? data.comments : [...prev, ...data.comments]
      );
      setHasMore(Boolean(data.hasMore));
      setPage(pageToFetch);
      setTotalTopLevel(Number(data.total || 0));

      // Prefetch replies
      const fetches = data.comments.map((c: Comment) =>
        commentService.getReplies(bookId, c._id).then(
          (res) => ({ id: c._id, replies: Array.isArray(res) ? res : [] }),
          () => ({ id: c._id, replies: [] })
        )
      );

      const settled = await Promise.all(fetches);
      setRepliesMap((prev) => {
        const next = { ...prev };
        settled.forEach((r) => {
          next[r.id] = r.replies;
        });
        return next;
      });
    } catch (err) {
      toast.error(t("fetchFailed"));
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (hasMore) await fetchComments(page + 1);
  };

  const fetchReplies = async (parentId: string) => {
    try {
      const data = await commentService.getReplies(bookId, parentId);
      setRepliesMap((prev) => ({
        ...prev,
        [parentId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      toast.error(t("fetchReplyFailed"));
    }
  };

  const handleLike = async (id: string) => {
    if (!user?._id) return toast.warn(t("loginToLike"));

    try {
      const updated = await commentService.toggleLike(id, user._id);
      setComments((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
      setRepliesMap((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((parentId) => {
          next[parentId] = next[parentId].map((r) =>
            r._id === updated._id ? updated : r
          );
        });
        return next;
      });
    } catch (err) {
      toast.error(t("likeFailed"));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return toast.warn(t("emptyContent"));
    try {
      await commentService.create({
        user: user ? user._id : null,
        bookId,
        content,
        parentComment: parent?._id,
      });
      setContent("");
      setParent(null);
    } catch {
      toast.error(t("createFailed"));
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return toast.warn(t("emptyContent"));
    try {
      await commentService.update(id, editContent);
      setEditingId(null);
    } catch {
      toast.error(t("updateFailed"));
    }
  };

  const openDeleteConfirm = (id: string) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!toDeleteId) return setConfirmOpen(false);
    try {
      await commentService.remove(toDeleteId);
      toast.success(t("deleteSuccess"))
      setConfirmOpen(false);
      setToDeleteId(null);
      await resetAndFetch();
    } catch {
      toast.error(t("deleteFailed"));
      setConfirmOpen(false);
    }
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
        title={t("deleteConfirmTitle")}
        message={t("deleteConfirmMsg")}
        confirmText={t("deleteConfirm")}
        cancelText={t("cancel")}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          {/* Show TOTAL top-level comments from server */}
          <span className="px-2.5 py-0.5 bg-orange-600 text-white text-sm font-semibold rounded-full">
            {totalTopLevel}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setSortBy(sortBy === "recent" ? "oldest" : "recent")}
            className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-gray-900"
          >
            {sortBy === "recent" ? t("newest") : t("oldest")}
          </button>
        </div>
      </div>

      {/* Comments List (top-level) */}
      <div className="space-y-6">
        {sortedComments().map((c) => {
          const replies = repliesMap[c._id] || [];
          const isOpen = showReplies[c._id];

          return (
            <div key={c._id} className="mb-6">
              <CommentItem
                comment={c}
                userId={user?._id}
                isEditing={editingId === c._id}
                editContent={editContent}
                openMenuId={openMenuId}
                onLike={handleLike}
                onReply={setParent}
                onEdit={(id) => {
                  if (editingId === id) handleEdit(id);
                  else {
                    setEditingId(id);
                    setEditContent(c.content);
                  }
                }}
                onEditChange={setEditContent}
                onEditCancel={() => setEditingId(null)}
                onDelete={openDeleteConfirm}
                onToggleMenu={setOpenMenuId}
              />

              {replies.length > 0 && (
                <div className="ml-12">
                  <button
                    onClick={async () => {
                      const newOpen = !isOpen;
                      setShowReplies((prev) => ({
                        ...prev,
                        [c._id]: newOpen,
                      }));
                      if (newOpen && !repliesMap[c._id]) {
                        await fetchReplies(c._id);
                      }
                    }}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    {isOpen
                      ? t("replyHide")
                      : t("replyShow", { count: replies.length })
                    }
                  </button>
                  {isOpen && replies && replies.length > 0 && (
                    <ReplyList
                      replies={replies}
                      userId={user?._id}
                      openMenuId={openMenuId}
                      editContent={editContent}
                      editingId={editingId}
                      onLike={handleLike}
                      onReply={setParent}
                      onEdit={(id) => {
                        if (editingId === id) handleEdit(id);
                        else {
                          const target = replies.find((r) => r._id === id);
                          if (target) setEditContent(target.content);
                          setEditingId(id);
                        }
                      }}
                      onEditChange={setEditContent}
                      onEditCancel={() => setEditingId(null)}
                      onDelete={openDeleteConfirm}
                      onToggleMenu={setOpenMenuId}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      <div className="flex justify-center mt-4">
        {totalTopLevel === 0 ? (
          <div className="text-sm text-gray-500 italic">{t("noComment")}</div>
        ) : comments.length < 4 && totalTopLevel > limit ? (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            {loadingMore ? t("load") : t("loadMore")}
          </button>
        ) : totalTopLevel > 4 ? (
          <button
            onClick={() => setShowAllModal(true)}
            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition"
          >
            {t("viewAll", { count: totalTopLevel })}
          </button>
        ) : (
          <div className="text-sm text-gray-500">{t("noMore")}</div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 mt-6">
        {parent && (
          <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
            <span>{t("replyingTo", { name: parent.user?.name || "Bookholic" })}</span>
           <button onClick={() => setParent(null)} className="text-red-500 hover:text-red-700 text-xs" > ✕ {t("cancel")} </button>
          </div>
        )}

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="text-base font-semibold text-gray-700">{user?.name || "Bookholic"}</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("enterContent")}
            className="w-full p-4 pr-24 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex items-center justify-end mt-3">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-orange-600 text-white rounded-full text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              {t("send")}
            </button>
          </div>
        </div>
      </div>

      <AllCommentsModal
        show={showAllModal}
        onClose={() => setShowAllModal(false)}
        bookId={bookId}
      />
    </div>
  );
}
