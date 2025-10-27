"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { commentService } from "@/services/commentService";
import Comment from "@/interfaces/Comment";
import CommentItem from "./comment/CommentItem";
import ReplyList from "./comment/ReplyList";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "use-intl";

interface AllCommentsModalProps {
  show: boolean;
  onClose: () => void;
  bookId: string
}

export default function AllCommentsModal({
  show,
  onClose,
  bookId
}: AllCommentsModalProps) {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [repliesMap, setRepliesMap] = useState<Record<string, Comment[]>>({});
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const replyRef = useRef<HTMLTextAreaElement | null>(null);
    
    const t = useTranslations("comment");
    
    useEffect(() => {
        if (!show) return;
        setPage(1);
        setHasMore(true);
        setComments([]);
        setRepliesMap({});
        fetchComments(1, true);
    }, [show, bookId]);

    const fetchComments = async (pageToFetch: number, replace = false) => {
        try {
            if (pageToFetch !== 1) setLoadingMore(true);
                const data = await commentService.getByBook(bookId, pageToFetch, limit);
                setComments((prev) =>
                replace ? data.comments : [...prev, ...data.comments]
            );
            setHasMore(Boolean(data.hasMore));
            setPage(pageToFetch);
            const replyFetches = data.comments.map((c: Comment) =>
                commentService.getReplies(bookId, c._id)
            );
            const settled = await Promise.all(replyFetches);
            setRepliesMap((prev) => {
                const next = { ...prev };
                data.comments.forEach((c, i) => {
                    next[c._id] = settled[i] || [];
                });
                return next;
            });
        } catch (err) {
            toast.error(t("fetchFailed"));
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (show) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => (document.body.style.overflow = "");
    }, [show]);

    useEffect(() => {
        if (replyingTo && replyRef.current) {
        replyRef.current.focus();
        replyRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [replyingTo]);

    if (!show) return null;

    const handleLike = async (id: string) => {
        if (!user?._id) return toast.warn(t("loginToLike"));
        try {
            const updated = await commentService.toggleLike(id, user._id);
            updateCommentState(updated);
        } catch {
            toast.error(t("likeFailed"));
        }
    };

    const handleEdit = async (id: string) => {
        if (!editContent.trim()) return toast.warn(t("emptyContent"));
        try {
            const updated = await commentService.update(id, editContent);
            updateCommentState(updated);
            setEditingId(null);
        } catch {
            toast.error(t("updateFailed"));
        }
    };

  const handleDelete = async (id: string) => {
    try {
        await commentService.remove(id);
        setComments((prev) => prev.filter((c) => c._id !== id));
        setRepliesMap((prev) => {
        const next = { ...prev };
            Object.keys(next).forEach((k) => {
                next[k] = next[k].filter((r) => r._id !== id);
            });
        return next;
      });
    } catch {
      toast.error(t("deleteFailed"));
    }
  };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return toast.warn("Vui lòng nhập nội dung");
        if (!replyingTo) return;
        try {
            const created = await commentService.create({
                user: user ? user._id : null,
                bookId,
                content: replyContent,
                parentComment: replyingTo._id,
            });
            const parentId = replyingTo.parentComment?._id || replyingTo._id;
            setRepliesMap((prev) => ({
                ...prev,
                [parentId]: [...(prev[parentId] || []), created],
            }));
            setReplyingTo(null);
            setReplyContent("");
        } catch (err) {
            toast.error(t("fetchReplyFailed"));
        }
    };

    const updateCommentState = (updated: Comment) => {
        setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        setRepliesMap((prev) => {
        const next = { ...prev };
            Object.keys(next).forEach((k) => {
                next[k] = next[k].map((r) => (r._id === updated._id ? updated : r));
            });
            return next;
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">{t("titleAll")}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl leading-none">✕</button>
                </div>
                {comments.length === 0 ? (
                    <p className="text-sm font-medium text-gray-500 italic text-center mt-10">{t("noComment")}</p>
                ) : (
                    <div className="space-y-6 mt-4">
                        {comments.map((c) => {
                            const replies = repliesMap[c._id] || [];
                            return (
                                <div key={c._id}>
                                    <CommentItem
                                        comment={c}
                                        userId={user?._id}
                                        isEditing={editingId === c._id}
                                        editContent={editContent}
                                        openMenuId={openMenuId}
                                        onLike={handleLike}
                                        onReply={() => setReplyingTo(c)}
                                        onEdit={(id) => {
                                            if (editingId === id) handleEdit(id);
                                            else {
                                                setEditingId(id);
                                                setEditContent(c.content);
                                            }
                                        }}
                                        onEditChange={setEditContent}
                                        onEditCancel={() => setEditingId(null)}
                                        onDelete={handleDelete}
                                        onToggleMenu={setOpenMenuId}
                                    />
                                    {replyingTo?._id === c._id && (
                                        <div className="ml-12 mt-3 border-l border-gray-200 pl-4">
                                            <textarea
                                                ref={replyRef}
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                placeholder={`Trả lời @${c.user?.name || "Bookholic"}...`}
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                                                rows={2}
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-700">Hủy</button>
                                                <button onClick={handleReplySubmit} className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">Gửi</button>
                                            </div>
                                        </div>
                                    )}
                                    {replies.length > 0 && (
                                        <div className="ml-12 mt-3">
                                            <ReplyList
                                                replies={replies}
                                                userId={user?._id}
                                                openMenuId={openMenuId}
                                                editContent={editContent}
                                                editingId={editingId}
                                                onLike={handleLike}
                                                onReply={(r) => setReplyingTo(r)}
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
                                                onDelete={handleDelete}
                                                onToggleMenu={setOpenMenuId}
                                            />
                                            {replyingTo && replies.some((r) => r._id === replyingTo._id) && (
                                                <div className="ml-16 mt-4 border-l border-gray-200 pl-4">
                                                    <textarea
                                                        ref={replyRef}
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder={`Trả lời @${replyingTo.user?.name || "Bookholic"}...`}
                                                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-700">Hủy</button>
                                                        <button onClick={handleReplySubmit} className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">Gửi</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-center mt-8 mb-2">
                    {hasMore ? (
                        <button
                            onClick={() => fetchComments(page + 1)}
                            disabled={loadingMore}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition"
                        >
                            {loadingMore ? t("load") : t("loadMore")}
                        </button>
                    ) : (
                        <div className="text-sm font-medium text-gray-500">{t("noMore")}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
